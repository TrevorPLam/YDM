import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { authService } from "../services/auth";

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

    // Use AuthService for secure authentication
    const authResult = authService.authenticate(apiKey);

    if (!authResult.success) {
      logger.warn({
        msg: "Authentication failed",
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
        error: authResult.error,
        apiKeyPrefix: apiKey.substring(0, 8) + "...", // Log prefix for debugging
      });

      // Return appropriate status code based on error
      const statusCode = authResult.error?.includes("not properly configured") ? 500 : 401;
      
      res.status(statusCode).json({
        error: statusCode === 500 ? "Internal server error" : "Unauthorized",
        details: authResult.error,
      });
      return;
    }

    // Authentication successful - attach user info to request
    req.user = authResult.user;

    logger.info({
      msg: "Authentication successful",
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
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

    // If API key is provided, try to authenticate
    if (apiKey && typeof apiKey === "string") {
      const authResult = authService.authenticate(apiKey);

      if (authResult.success && authResult.user) {
        // Authentication successful - attach user info
        req.user = authResult.user;

        logger.info({
          msg: "Optional authentication successful",
          ip: req.ip,
          path: req.path,
          method: req.method,
          userId: req.user.id,
        });
      } else {
        // API key provided but invalid - log warning but don't block
        logger.warn({
          msg: "Optional authentication failed: Invalid API key (not blocking)",
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          path: req.path,
          method: req.method,
          error: authResult.error,
          apiKeyPrefix: apiKey.substring(0, 8) + "...",
        });
      }
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
