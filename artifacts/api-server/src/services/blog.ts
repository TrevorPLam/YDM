import { db } from "@workspace/db";
import { blogPosts, industries } from "@workspace/db/schema";
import { eq, desc, asc, ilike, and, or } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

/**
 * Blog service implementing business logic for blog post management
 * Follows DDD patterns and the task requirements:
 * - Part of Content Management bounded context
 * - Uses ubiquitous language from domain
 * - Thin interface hiding implementation details
 * - Proper error handling and logging
 * - Soft delete via archived status
 */

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  content: string;
  metaDescription?: string;
  industryId: number;
  isFeatured?: boolean;
  status?: "draft" | "published";
  authorId: number;
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  content?: string;
  metaDescription?: string;
  isFeatured?: boolean;
  status?: "draft" | "published" | "archived";
}

export interface BlogPostResponse {
  id: number;
  publicId: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  status: string;
  isFeatured: boolean;
  publishedAt?: string;
  authorId: number;
  industryId: number;
  industry?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListBlogPostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  industrySlug?: string;
  featured?: boolean;
  orderBy?: "published_at" | "created_at" | "title";
}

export interface BlogPostListResponse {
  blogPosts: BlogPostResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class BlogService {
  /**
   * Create a new blog post
   * Handles validation, slug generation, and persistence
   */
  async createBlogPost(payload: CreateBlogPostRequest): Promise<BlogPostResponse> {
    try {
      logger.info({
        msg: "Creating blog post",
        title: payload.title,
        industryId: payload.industryId,
        authorId: payload.authorId,
      });

      // Generate a unique public ID
      const publicId = this.generatePublicId();

      // Generate slug if not provided
      const slug = payload.slug || this.generateSlug(payload.title);

      // Validate industry exists
      const industry = await db
        .select()
        .from(industries)
        .where(eq(industries.id, payload.industryId))
        .limit(1);

      if (!industry || industry.length === 0) {
        throw new Error(`Industry with ID ${payload.industryId} not found`);
      }

      // Prepare blog post data
      const blogPostData = {
        publicId,
        title: payload.title,
        slug,
        content: payload.content,
        metaDescription: payload.metaDescription || null,
        industryId: payload.industryId,
        authorId: payload.authorId,
        isFeatured: payload.isFeatured || false,
        status: payload.status || "draft",
        publishedAt: payload.status === "published" ? new Date().toISOString() : null,
      };

      // Insert blog post into database
      const result = await db.insert(blogPosts).values(blogPostData).returning();

      if (!result || result.length === 0) {
        throw new Error("Failed to create blog post");
      }

      const savedPost = result[0];

      logger.info({
        msg: "Blog post created successfully",
        postId: savedPost.id,
        publicId: savedPost.publicId,
        slug: savedPost.slug,
        status: savedPost.status,
      });

      // Return response matching OpenAPI schema
      return this.formatBlogPostResponse(savedPost, industry[0]);
    } catch (error) {
      logger.error({
        msg: "Failed to create blog post",
        error: error instanceof Error ? error.message : String(error),
        title: payload.title,
        industryId: payload.industryId,
      });

      throw error;
    }
  }

  /**
   * List blog posts with filtering and pagination
   * Only returns published posts (not draft or archived)
   */
  async listBlogPosts(options: ListBlogPostsOptions): Promise<BlogPostListResponse> {
    try {
      const page = options.page || 0;
      const limit = Math.min(options.limit || 10, 100); // Max 100 per page
      const offset = page * limit;

      logger.info({
        msg: "Listing blog posts",
        page,
        limit,
        search: options.search,
        industrySlug: options.industrySlug,
        featured: options.featured,
        orderBy: options.orderBy,
      });

      // Build query conditions
      const conditions = [eq(blogPosts.status, "published")]; // Only published posts

      // Add search filter
      if (options.search) {
        conditions.push(
          or(
            ilike(blogPosts.title, `%${options.search}%`),
            ilike(blogPosts.content, `%${options.search}%`)
          )!
        );
      }

      // Add industry filter (by slug)
      if (options.industrySlug) {
        conditions.push(ilike(industries.slug, options.industrySlug));
      }

      // Add featured filter
      if (options.featured !== undefined) {
        conditions.push(eq(blogPosts.isFeatured, options.featured));
      }

      // Determine sort order
      let orderBy;
      switch (options.orderBy) {
        case "created_at":
          orderBy = desc(blogPosts.createdAt);
          break;
        case "title":
          orderBy = asc(blogPosts.title);
          break;
        case "published_at":
        default:
          orderBy = desc(blogPosts.publishedAt);
          break;
      }

      // Execute query with joins
      const result = await db
        .select({
          id: blogPosts.id,
          publicId: blogPosts.publicId,
          title: blogPosts.title,
          slug: blogPosts.slug,
          content: blogPosts.content,
          metaDescription: blogPosts.metaDescription,
          status: blogPosts.status,
          isFeatured: blogPosts.isFeatured,
          publishedAt: blogPosts.publishedAt,
          authorId: blogPosts.authorId,
          industryId: blogPosts.industryId,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          industryIdJoined: industries.id,
          industryName: industries.name,
          industrySlug: industries.slug,
        })
        .from(blogPosts)
        .leftJoin(industries, eq(blogPosts.industryId, industries.id))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Format blog posts
      const blogPostsFormatted = result.map((post: any) => ({
        id: post.id,
        publicId: post.publicId,
        title: post.title,
        slug: post.slug,
        content: post.content,
        metaDescription: post.metaDescription || undefined,
        status: post.status,
        isFeatured: post.isFeatured,
        publishedAt: post.publishedAt || undefined,
        authorId: post.authorId,
        industryId: post.industryId,
        industry: post.industryIdJoined ? {
          id: post.industryIdJoined,
          name: post.industryName,
          slug: post.industrySlug,
        } : undefined,
        createdAt: new Date(post.createdAt).toISOString(),
        updatedAt: new Date(post.updatedAt).toISOString(),
      }));

      // Get total count for pagination
      const totalCount = await db
        .select({ count: blogPosts.id })
        .from(blogPosts)
        .leftJoin(industries, eq(blogPosts.industryId, industries.id))
        .where(and(...conditions));

      const total = totalCount.length;

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages - 1;
      const hasPrev = page > 0;

      logger.info({
        msg: "Blog posts listed successfully",
        count: blogPostsFormatted.length,
        total,
        page,
        totalPages,
      });

      return {
        blogPosts: blogPostsFormatted,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      logger.error({
        msg: "Failed to list blog posts",
        error: error instanceof Error ? error.message : String(error),
        options,
      });

      throw error;
    }
  }

  /**
   * Get a blog post by slug
   * Only returns published posts
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPostResponse | null> {
    try {
      logger.info({
        msg: "Retrieving blog post by slug",
        slug,
      });

      const result = await db
        .select({
          id: blogPosts.id,
          publicId: blogPosts.publicId,
          title: blogPosts.title,
          slug: blogPosts.slug,
          content: blogPosts.content,
          metaDescription: blogPosts.metaDescription,
          status: blogPosts.status,
          isFeatured: blogPosts.isFeatured,
          publishedAt: blogPosts.publishedAt,
          authorId: blogPosts.authorId,
          industryId: blogPosts.industryId,
          createdAt: blogPosts.createdAt,
          updatedAt: blogPosts.updatedAt,
          industryIdJoined: industries.id,
          industryName: industries.name,
          industrySlug: industries.slug,
        })
        .from(blogPosts)
        .leftJoin(industries, eq(blogPosts.industryId, industries.id))
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
        .limit(1);

      if (!result || result.length === 0) {
        logger.info({
          msg: "Blog post not found",
          slug,
        });
        return null;
      }

      const post = result[0];

      logger.info({
        msg: "Blog post retrieved successfully",
        postId: post.id,
        slug: post.slug,
      });

      return this.formatBlogPostResponse(post, {
        id: post.industryIdJoined!,
        name: post.industryName!,
        slug: post.industrySlug!,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve blog post",
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      throw error;
    }
  }

  /**
   * Update a blog post by slug
   * Can update any status including archived (soft delete)
   */
  async updateBlogPost(slug: string, payload: UpdateBlogPostRequest): Promise<BlogPostResponse> {
    try {
      logger.info({
        msg: "Updating blog post",
        slug,
        updates: Object.keys(payload),
      });

      // Find existing blog post
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, slug))
        .limit(1);

      if (!existing || existing.length === 0) {
        throw new Error(`Blog post with slug '${slug}' not found`);
      }

      const existingPost = existing[0];

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      // Update provided fields
      if (payload.title !== undefined) updateData.title = payload.title;
      if (payload.slug !== undefined) updateData.slug = payload.slug;
      if (payload.content !== undefined) updateData.content = payload.content;
      if (payload.metaDescription !== undefined) updateData.metaDescription = payload.metaDescription;
      if (payload.isFeatured !== undefined) updateData.isFeatured = payload.isFeatured;
      if (payload.status !== undefined) {
        updateData.status = payload.status;
        // Set publishedAt when publishing for the first time
        if (payload.status === "published" && existingPost.status !== "published") {
          updateData.publishedAt = new Date().toISOString();
        }
        // Clear publishedAt when archiving
        if (payload.status === "archived") {
          updateData.publishedAt = null;
        }
      }

      // Update blog post
      const result = await db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.slug, slug))
        .returning();

      if (!result || result.length === 0) {
        throw new Error("Failed to update blog post");
      }

      const updatedPost = result[0];

      // Get industry information
      const industry = await db
        .select()
        .from(industries)
        .where(eq(industries.id, updatedPost.industryId))
        .limit(1);

      logger.info({
        msg: "Blog post updated successfully",
        postId: updatedPost.id,
        slug: updatedPost.slug,
        status: updatedPost.status,
      });

      return this.formatBlogPostResponse(updatedPost, industry[0]);
    } catch (error) {
      logger.error({
        msg: "Failed to update blog post",
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      throw error;
    }
  }

  /**
   * Delete a blog post by slug (soft delete)
   * Sets status to archived
   */
  async deleteBlogPost(slug: string): Promise<void> {
    try {
      logger.info({
        msg: "Deleting blog post",
        slug,
      });

      // Update status to archived (soft delete)
      const result = await db
        .update(blogPosts)
        .set({
          status: "archived",
          publishedAt: null, // Clear publication date
          updatedAt: new Date().toISOString(),
        })
        .where(eq(blogPosts.slug, slug))
        .returning();

      if (!result || result.length === 0) {
        throw new Error(`Blog post with slug '${slug}' not found`);
      }

      logger.info({
        msg: "Blog post deleted successfully",
        postId: result[0].id,
        slug: result[0].slug,
      });
    } catch (error) {
      logger.error({
        msg: "Failed to delete blog post",
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      throw error;
    }
  }

  /**
   * Generate a unique public ID for blog posts
   */
  private generatePublicId(): string {
    return crypto.randomBytes(6).toString("hex").toUpperCase();
  }

  /**
   * Generate a URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Format blog post response matching OpenAPI schema
   */
  private formatBlogPostResponse(post: any, industry: any): BlogPostResponse {
    return {
      id: post.id,
      publicId: post.publicId,
      title: post.title,
      slug: post.slug,
      content: post.content,
      metaDescription: post.metaDescription || undefined,
      status: post.status,
      isFeatured: post.isFeatured,
      publishedAt: post.publishedAt || undefined,
      authorId: post.authorId,
      industryId: post.industryId,
      industry: {
        id: industry.id,
        name: industry.name,
        slug: industry.slug,
      },
      createdAt: new Date(post.createdAt).toISOString(),
      updatedAt: new Date(post.updatedAt).toISOString(),
    };
  }
}

// Export singleton instance
export const blogService = new BlogService();
