import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Simple API key authentication middleware
 * Validates X-API-Key header against environment variable
 * Follows security best practices for admin endpoints
 */

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    type: "admin";
  };
}

/**
 * API Key Authentication Middleware
 * 
 * Validates the X-API-Key header against the configured admin API key.
 * This is a simple authentication mechanism suitable for admin endpoints.
 * 
 * @param req Express request object
 * @param res Express response object  
 * @param next Express next function
 */
export const requireApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get API key from header
    const apiKey = req.headers["x-api-key"];

    // Check if API key is provided
    if (!apiKey || typeof apiKey !== "string") {
      logger.warn({
        msg: "Authentication failed: Missing API key",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      });

      res.status(401).json({
        error: "Unauthorized",
        details: "API key is required",
      });
      return;
    }

    // Get configured API key from environment
    const configuredApiKey = process.env.ADMIN_API_KEY;

    // Check if environment variable is configured
    if (!configuredApiKey) {
      logger.error({
        msg: "Authentication configuration error: ADMIN_API_KEY not set",
        path: req.path,
        method: req.method,
      });

      res.status(500).json({
        error: "Internal server error",
        details: "Authentication service not properly configured",
      });
      return;
    }

    // Validate API key
    if (apiKey !== configuredApiKey) {
      logger.warn({
        msg: "Authentication failed: Invalid API key",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
        apiKeyPrefix: apiKey.substring(0, 8) + "...", // Log prefix for debugging
      });

      res.status(401).json({
        error: "Unauthorized", 
        details: "Invalid API key",
      });
      return;
    }

    // Authentication successful - attach user info to request
    req.user = {
      id: "admin-user",
      type: "admin",
    };

    logger.info({
      msg: "Authentication successful",
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: req.user.id,
    });

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    logger.error({
      msg: "Authentication middleware error",
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: "Internal server error",
      details: "Authentication service error",
    });
  }
};

/**
 * Optional API Key Authentication Middleware
 * 
 * Similar to requireApiKey but doesn't block requests without API keys.
 * Useful for endpoints that have different behavior for authenticated vs unauthenticated users.
 * 
 * @param req Express request object
 * @param res Express response object  
 * @param next Express next function
 */
export const optionalApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const apiKey = req.headers["x-api-key"];
    const configuredApiKey = process.env.ADMIN_API_KEY;

    // If API key is provided and valid, attach user info
    if (apiKey && typeof apiKey === "string" && configuredApiKey && apiKey === configuredApiKey) {
      req.user = {
        id: "admin-user", 
        type: "admin",
      };

      logger.info({
        msg: "Optional authentication successful",
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user.id,
      });
    } else if (apiKey) {
      // API key provided but invalid - log warning but don't block
      logger.warn({
        msg: "Optional authentication failed: Invalid API key (not blocking)",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
        apiKeyPrefix: typeof apiKey === "string" ? apiKey.substring(0, 8) + "..." : "invalid",
      });
    }

    // Continue regardless of authentication status
    next();
  } catch (error) {
    logger.error({
      msg: "Optional authentication middleware error",
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      method: req.method,
    });

    // Continue even on error for optional auth
    next();
  }
};
