import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware for API routes
 * Validates API key for protected endpoints
 */

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * API Key authentication middleware
 */
export const requireApiKey = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // For testing purposes, we'll mock the authentication
  // In production, this would validate a real API key
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required'
    });
  }

  // Mock user for testing
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Mock rate limiting for testing
  next();
};
