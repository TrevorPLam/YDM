import { Router, type Request, Response, NextFunction } from "express";
import { industryService } from "../services/industries";
import { logger } from "../lib/logger";

/**
 * Industry routes module
 * Implements industry data endpoints following the OpenAPI specification
 * Uses thin controllers that delegate to services
 * Follows DDD patterns and the task requirements
 */

const router = Router();

/**
 * GET /api/industries
 * List industries with pagination, search, and sorting
 * 
 * Query parameters: page, limit, search, orderBy
 * Response: IndustryListResponse (200) or Error (400/500)
 */
router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract and validate query parameters
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const search = req.query.search as string | undefined;
      const orderBy = req.query.orderBy as 'name' | 'created_at' | undefined;

      // Validate parameters using service method
      industryService.validateListIndustriesParams({
        page,
        limit,
        search,
        orderBy,
      });

      logger.info({
        msg: "Processing industries list request",
        page,
        limit,
        search,
        orderBy,
      });

      // Delegate to industry service for business logic
      const result = await industryService.listIndustries({
        page,
        limit,
        search,
        orderBy,
      });

      logger.info({
        msg: "Industries list processed successfully",
        count: result.industries.length,
        total: result.pagination.total,
        page: result.pagination.page,
      });

      // Return 200 with the industry list response matching OpenAPI schema
      return res.json(result);
    } catch (error) {
      logger.error({
        msg: "Failed to process industries list request",
        error: error instanceof Error ? error.message : String(error),
        query: req.query,
      });

      // Return 400 for validation errors, 500 for other errors
      const statusCode = error instanceof Error && error.message.includes('must be') ? 400 : 500;
      return res.status(statusCode).json({
        error: error instanceof Error ? error.message : "Failed to list industries",
      });
    }
  }
);

/**
 * GET /api/industries/:slug
 * Get a single industry by slug
 * 
 * Response: IndustryResponse (200) or Error (404/500)
 */
router.get(
  "/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;

      // Ensure slug is a string (Express can return string arrays in some cases)
      const slugString = Array.isArray(slug) ? slug[0] : slug;

      logger.info({
        msg: "Retrieving industry by slug",
        slug: slugString,
      });

      const industry = await industryService.getIndustryBySlug(slugString);

      if (!industry) {
        logger.info({
          msg: "Industry not found",
          slug,
        });

        return res.status(404).json({
          error: "Industry not found",
        });
      }

      logger.info({
        msg: "Industry retrieved successfully",
        industryId: industry.id,
        slug: industry.slug,
      });

      return res.json(industry);
    } catch (error) {
      logger.error({
        msg: "Failed to retrieve industry",
        error: error instanceof Error ? error.message : String(error),
        slug: req.params?.slug,
      });

      // Return 400 for validation errors, 500 for other errors
      const statusCode = error instanceof Error && error.message.includes('must be') ? 400 : 500;
      return res.status(statusCode).json({
        error: error instanceof Error ? error.message : "Failed to retrieve industry",
      });
    }
  }
);

export default router;
