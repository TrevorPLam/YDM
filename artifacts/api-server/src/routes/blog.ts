import { Router, type Request, Response, NextFunction } from "express";
import { requireApiKey, type AuthenticatedRequest } from "../middleware/auth";
import { blogService } from "../services/blog";
import { validateRequest } from "../middlewares/validation";
import { logger } from "../lib/logger";

/**
 * Blog routes module
 * Implements blog CRUD endpoints following the OpenAPI specification
 * Uses thin controllers that delegate to services
 * Follows DDD patterns and the task requirements
 */

const router = Router();

/**
 * GET /api/blog/posts
 * List blog posts with pagination, search, and filtering
 * 
 * Query parameters: page, limit, search, industrySlug, featured, orderBy
 * Response: BlogPostListResponse (200) or Error (400/500)
 */
router.get(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract and validate query parameters
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string | undefined;
      const industrySlug = req.query.industrySlug as string | undefined;
      const featured = req.query.featured ? req.query.featured === "true" : undefined;
      const orderBy = req.query.orderBy as "published_at" | "created_at" | "title" | undefined;

      // Validate parameters
      if (page !== undefined && (isNaN(page) || page < 0)) {
        return res.status(400).json({
          error: "Invalid page parameter",
          details: "Page must be a non-negative integer",
        });
      }

      if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
        return res.status(400).json({
          error: "Invalid limit parameter", 
          details: "Limit must be between 1 and 100",
        });
      }

      if (orderBy !== undefined && !["published_at", "created_at", "title"].includes(orderBy)) {
        return res.status(400).json({
          error: "Invalid orderBy parameter",
          details: "OrderBy must be one of: published_at, created_at, title",
        });
      }

      logger.info({
        msg: "Processing blog posts list request",
        page,
        limit,
        search,
        industrySlug,
        featured,
        orderBy,
      });

      // Delegate to blog service for business logic
      const result = await blogService.listBlogPosts({
        page,
        limit,
        search,
        industrySlug,
        featured,
        orderBy,
      });

      logger.info({
        msg: "Blog posts list processed successfully",
        count: result.blogPosts.length,
        total: result.pagination.total,
        page: result.pagination.page,
      });

      // Return 200 with the blog posts list response matching OpenAPI schema
      return res.json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to process blog posts list request",
        error: error instanceof Error ? error.message : String(error),
        query: req.query,
      });

      // Return 400 for validation errors, 500 for other errors
      const statusCode = error instanceof Error && error.message.includes('must be') ? 400 : 500;
      return res.status(statusCode).json({
        error: error instanceof Error ? error.message : "Failed to list blog posts",
      });
    }
  }
);

/**
 * POST /api/blog/posts
 * Create a new blog post
 * 
 * Request body: CreateBlogPostRequest
 * Response: BlogPostResponse (201) or Error (400/401/500)
 */
router.post(
  "/posts",
  requireApiKey,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Request body validation will be handled by middleware when we add it
      const blogData = req.body as any;

      // Validate required fields
      if (!blogData.title || typeof blogData.title !== "string") {
        return res.status(400).json({
          error: "Invalid input",
          details: "Title is required and must be a string",
        });
      }

      if (!blogData.content || typeof blogData.content !== "string") {
        return res.status(400).json({
          error: "Invalid input",
          details: "Content is required and must be a string",
        });
      }

      if (!blogData.industryId || typeof blogData.industryId !== "number") {
        return res.status(400).json({
          error: "Invalid input",
          details: "Industry ID is required and must be a number",
        });
      }

      // Add author ID from authenticated user (for now, use a default)
      // In a real implementation, this would come from the authenticated user
      blogData.authorId = 1; // Default admin user for now

      logger.info({
        msg: "Processing blog post creation request",
        title: blogData.title,
        industryId: blogData.industryId,
        userId: req.user?.id,
      });

      // Delegate to blog service for business logic
      const result = await blogService.createBlogPost(blogData);

      logger.info({
        msg: "Blog post created successfully",
        postId: result.id,
        publicId: result.publicId,
        slug: result.slug,
        userId: req.user?.id,
      });

      // Return 201 with the blog post response matching OpenAPI schema
      return res.status(201).json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to process blog post creation request",
        error: error instanceof Error ? error.message : String(error),
        userId: req.user?.id,
        title: req.body?.title,
      });

      // Return appropriate error responses
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(400).json({
          error: "Invalid input",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create blog post",
      });
    }
  }
);

/**
 * GET /api/blog/posts/:slug
 * Get a single blog post by slug
 * 
 * Response: BlogPostResponse (200) or Error (404/500)
 */
router.get(
  "/posts/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      // Ensure slug is a string (Express can return string arrays in some cases)
      const slugString = Array.isArray(slug) ? slug[0] : slug;

      if (!slugString || typeof slugString !== "string") {
        return res.status(400).json({
          error: "Invalid slug parameter",
          details: "Slug must be a non-empty string",
        });
      }

      logger.info({
        msg: "Retrieving blog post by slug",
        slug: slugString,
      });

      const blogPost = await blogService.getBlogPostBySlug(slugString);

      if (!blogPost) {
        logger.info({
          msg: "Blog post not found",
          slug: slugString,
        });

        return res.status(404).json({
          error: "Blog post not found",
        });
      }

      logger.info({
        msg: "Blog post retrieved successfully",
        postId: blogPost.id,
        slug: blogPost.slug,
      });

      return res.json(blogPost);
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve blog post",
        error: error instanceof Error ? error.message : String(error),
        slug: req.params?.slug,
      });

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to retrieve blog post",
      });
    }
  }
);

/**
 * PUT /api/blog/posts/:slug
 * Update a blog post
 * 
 * Request body: UpdateBlogPostRequest
 * Response: BlogPostResponse (200) or Error (400/401/404/500)
 */
router.put(
  "/posts/:slug",
  requireApiKey,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      const updateData = req.body as any;

      // Ensure slug is a string
      const slugString = Array.isArray(slug) ? slug[0] : slug;

      if (!slugString || typeof slugString !== "string") {
        return res.status(400).json({
          error: "Invalid slug parameter",
          details: "Slug must be a non-empty string",
        });
      }

      // Validate status if provided
      if (updateData.status !== undefined) {
        const validStatuses = ["draft", "published", "archived"];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            error: "Invalid status",
            details: "Status must be one of: draft, published, archived",
          });
        }
      }

      logger.info({
        msg: "Processing blog post update request",
        slug: slugString,
        updates: Object.keys(updateData),
        userId: req.user?.id,
      });

      // Delegate to blog service for business logic
      const result = await blogService.updateBlogPost(slugString, updateData);

      logger.info({
        msg: "Blog post updated successfully",
        postId: result.id,
        slug: result.slug,
        status: result.status,
        userId: req.user?.id,
      });

      return res.json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to update blog post",
        error: error instanceof Error ? error.message : String(error),
        slug: req.params?.slug,
        userId: req.user?.id,
      });

      // Return appropriate error responses
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({
          error: "Blog post not found",
        });
      }

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update blog post",
      });
    }
  }
);

/**
 * DELETE /api/blog/posts/:slug
 * Delete a blog post (soft delete)
 * 
 * Response: 204 or Error (401/404/500)
 */
router.delete(
  "/posts/:slug",
  requireApiKey,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      // Ensure slug is a string
      const slugString = Array.isArray(slug) ? slug[0] : slug;

      if (!slugString || typeof slugString !== "string") {
        return res.status(400).json({
          error: "Invalid slug parameter",
          details: "Slug must be a non-empty string",
        });
      }

      logger.info({
        msg: "Processing blog post deletion request",
        slug: slugString,
        userId: req.user?.id,
      });

      // Delegate to blog service for business logic
      await blogService.deleteBlogPost(slugString);

      logger.info({
        msg: "Blog post deleted successfully",
        slug: slugString,
        userId: req.user?.id,
      });

      // Return 204 for successful deletion
      return res.status(204).send();
    } catch (error) {
      logger.error({
        msg: "Failed to delete blog post",
        error: error instanceof Error ? error.message : String(error),
        slug: req.params?.slug,
        userId: req.user?.id,
      });

      // Return appropriate error responses
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({
          error: "Blog post not found",
        });
      }

      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete blog post",
      });
    }
  }
);

export default router;
