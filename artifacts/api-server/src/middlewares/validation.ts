import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../lib/logger";

/**
 * Validation middleware factory using Zod schemas
 * Follows best practices from research:
 * - Modular and reusable
 * - Proper error handling with structured responses
 * - TypeScript integration
 */
export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body and replace with validated data
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      
      logger.info({
        msg: "Request validation successful",
        path: req.path,
        method: req.method,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Structured error response following OpenAPI Error schema
        const errorDetails = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn({
          msg: "Request validation failed",
          path: req.path,
          method: req.method,
          errors: errorDetails,
        });

        res.status(400).json({
          error: "Invalid input",
          details: errorDetails,
        });
      } else {
        logger.error({
          msg: "Unexpected validation error",
          path: req.path,
          method: req.method,
          error: error instanceof Error ? error.message : String(error),
        });

        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
};

/**
 * Query parameter validation middleware
 * Useful for GET endpoints with query strings
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = await schema.parseAsync(req.query);
      req.query = validatedQuery as any;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: "Invalid query parameters",
          details: errorDetails,
        });
      } else {
        res.status(500).json({
          error: "Internal server error",
        });
      }
    }
  };
};
