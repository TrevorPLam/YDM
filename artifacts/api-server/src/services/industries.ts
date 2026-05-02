import { db } from "@workspace/db";
import { industries } from "@workspace/db/schema";
import { eq, ilike, desc, asc, sql, count, and, or } from "drizzle-orm";
import { logger } from "../lib/logger";
import { cache } from "../lib/cache";

/**
 * Industry service implementing business logic for industry data operations
 * Follows DDD patterns and the task requirements:
 * - Part of Content Management bounded context
 * - Uses ubiquitous language from domain
 * - Thin interface hiding implementation details
 * - Proper error handling and logging
 * - Pagination and search functionality
 */

export interface IndustryResponse {
  id: number;
  publicId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IndustryListResponse {
  industries: IndustryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ListIndustriesOptions {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: 'name' | 'created_at';
}

class IndustryService {
  /**
   * List industries with pagination, search, and sorting
   */
  async listIndustries(options: ListIndustriesOptions = {}): Promise<IndustryListResponse> {
    try {
      const page = Math.max(options.page || 0, 0);
      const limit = Math.min(Math.max(options.limit || 10, 1), 100); // Between 1-100
      const offset = page * limit;
      const search = options.search?.trim();
      const orderBy = options.orderBy || 'name';

      logger.info({
        msg: "Listing industries",
        page,
        limit,
        search,
        orderBy,
      });

      // For non-search queries, try cache first (cache only for simple list queries)
      if (!search) {
        const cacheKey = `industries:list:${page}:${limit}:${orderBy}`;
        const cachedResult = cache.get<IndustryListResponse>(cacheKey);
        if (cachedResult) {
          logger.info({
            msg: "Industries retrieved from cache",
            page,
            limit,
            orderBy,
          });
          return cachedResult;
        }
      }

      // Build the query with search and pagination
      let results: any[] = [];
      let total = 0;
      
      if (search) {
        // Try to use full-text search first (requires search_vector column)
        try {
          // Full-text search query
          const searchCondition = sql`${industries.searchVector} @@ plainto_tsquery('english', ${search})`;
          const fallbackCondition = or(
            ilike(industries.name, `%${search}%`),
            ilike(industries.description, `%${search}%`)
          );
          const combinedCondition = and(searchCondition, fallbackCondition);
          
          // Get count with search
          const countQuery = db.select({ count: count() }).from(industries).where(combinedCondition);
          const countResult = await countQuery;
          total = countResult[0]?.count || 0;
          
          // Get results with search
          const searchQuery = db.select().from(industries).where(combinedCondition);
          const orderByClause = orderBy === 'created_at' 
            ? desc(industries.createdAt)
            : asc(industries.name);
          
          results = await searchQuery
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);
            
        } catch (error) {
          // Fallback to simple ILIKE search if search_vector doesn't exist
          logger.warn({
            msg: "Full-text search not available, using ILIKE fallback",
            error: error instanceof Error ? error.message : String(error),
          });
          
          const searchCondition = or(
            ilike(industries.name, `%${search}%`),
            ilike(industries.description, `%${search}%`)
          );
          
          // Get count with search
          const countQuery = db.select({ count: count() }).from(industries).where(searchCondition);
          const countResult = await countQuery;
          total = countResult[0]?.count || 0;
          
          // Get results with search
          const searchQuery = db.select().from(industries).where(searchCondition);
          const orderByClause = orderBy === 'created_at' 
            ? desc(industries.createdAt)
            : asc(industries.name);
            
          results = await searchQuery
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);
        }
      } else {
        // No search - get all industries
        const countQuery = db.select({ count: count() }).from(industries);
        const countResult = await countQuery;
        total = countResult[0]?.count || 0;
        
        const orderByClause = orderBy === 'created_at' 
          ? desc(industries.createdAt)
          : asc(industries.name);
          
        results = await db.select()
          .from(industries)
          .orderBy(orderByClause)
          .limit(limit)
          .offset(offset);
      }

      // No need for additional filtering since it's done in the database
      let filteredResults = results;

      // Transform database results to API response format
      const industryResponses: IndustryResponse[] = filteredResults.map((industry: any) => ({
        id: industry.id,
        publicId: industry.publicId,
        name: industry.name,
        slug: industry.slug,
        description: industry.description,
        createdAt: new Date(industry.createdAt).toISOString(),
        updatedAt: new Date(industry.updatedAt).toISOString(),
      }));

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages - 1;
      const hasPrev = page > 0;

      const response: IndustryListResponse = {
        industries: industryResponses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };

      logger.info({
        msg: "Industries listed successfully",
        count: industryResponses.length,
        total,
        page,
        totalPages,
      });

      // Cache the result for non-search queries (5 minutes TTL)
      if (!search) {
        const cacheKey = `industries:list:${page}:${limit}:${orderBy}`;
        cache.set(cacheKey, response, 5 * 60 * 1000); // 5 minutes
        logger.info({
          msg: "Industries cached",
          page,
          limit,
          orderBy,
        });
      }

      return response;
    } catch (error) {
      logger.error({
        msg: "Failed to list industries",
        error: error instanceof Error ? error.message : String(error),
        options,
      });

      throw error;
    }
  }

  /**
   * Get a single industry by slug
   */
  async getIndustryBySlug(slug: string): Promise<IndustryResponse | null> {
    try {
      if (!slug || typeof slug !== "string") {
        throw new Error("Invalid slug provided");
      }

      if (slug.length > 100) {
        throw new Error("Slug too long");
      }

      logger.info({
        msg: "Retrieving industry by slug",
        slug,
      });

      // Try cache first
      const cacheKey = `industry:slug:${slug}`;
      const cachedResult = cache.get<IndustryResponse>(cacheKey);
      if (cachedResult) {
        logger.info({
          msg: "Industry retrieved from cache",
          slug,
        });
        return cachedResult;
      }

      const result = await db
        .select()
        .from(industries)
        .where(eq(industries.slug, slug))
        .limit(1);

      if (!result || result.length === 0) {
        return null;
      }

      const industry = result[0];

      const response: IndustryResponse = {
        id: industry.id,
        publicId: industry.publicId,
        name: industry.name,
        slug: industry.slug,
        description: industry.description,
        createdAt: new Date(industry.createdAt).toISOString(),
        updatedAt: new Date(industry.updatedAt).toISOString(),
      };

      logger.info({
        msg: "Industry retrieved successfully",
        industryId: industry.id,
        slug: industry.slug,
      });

      // Cache the result (10 minutes TTL for individual items)
      cache.set(cacheKey, response, 10 * 60 * 1000); // 10 minutes
      logger.info({
        msg: "Industry cached",
        slug,
      });

      return response;
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve industry",
        error: error instanceof Error ? error.message : String(error),
        slug,
      });

      throw error;
    }
  }

  /**
   * Validate list industries query parameters
   */
  validateListIndustriesParams(options: ListIndustriesOptions): void {
    // Validate page
    if (options.page !== undefined) {
      if (typeof options.page !== 'number' || options.page < 0 || !Number.isInteger(options.page)) {
        throw new Error("Page must be a non-negative integer");
      }
    }

    // Validate limit
    if (options.limit !== undefined) {
      if (typeof options.limit !== 'number' || options.limit < 1 || options.limit > 100 || !Number.isInteger(options.limit)) {
        throw new Error("Limit must be an integer between 1 and 100");
      }
    }

    // Validate search
    if (options.search !== undefined) {
      if (typeof options.search !== 'string') {
        throw new Error("Search must be a string");
      }
      const trimmedSearch = options.search.trim();
      if (trimmedSearch.length === 0) {
        throw new Error("Search cannot be empty");
      }
      if (trimmedSearch.length > 100) {
        throw new Error("Search term too long (max 100 characters)");
      }
    }

    // Validate orderBy
    if (options.orderBy !== undefined) {
      if (!['name', 'created_at'].includes(options.orderBy)) {
        throw new Error("OrderBy must be one of: name, created_at");
      }
    }
  }
}

// Export singleton instance
export const industryService = new IndustryService();
