import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * In-memory rate limiter for API endpoints
 * Follows OWASP API4:2023 best practices for unrestricted resource consumption
 * Uses sliding window approach with configurable limits
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    windowStart: number;
  };
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = `Too many requests. Maximum ${maxRequests} requests per ${windowMs}ms allowed.`
  } = options;

  const store: RateLimitStore = {};

  // Cleanup function to remove expired entries
  const cleanup = () => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    }
  };

  // Run cleanup every 5 minutes
  const cleanupInterval = setInterval(cleanup, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or get existing record
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
        windowStart: now
      };
    }

    const record = store[key];

    // Reset window if expired
    if (now >= record.resetTime) {
      record.count = 0;
      record.windowStart = now;
      record.resetTime = now + windowMs;
    }

    // Increment request count
    record.count++;

    // Calculate remaining requests and reset time
    const remainingRequests = Math.max(0, maxRequests - record.count);
    const resetTimeInSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remainingRequests.toString(),
      'X-RateLimit-Reset': resetTimeInSeconds.toString()
    });

    logger.info({
      msg: "Rate limit check",
      key,
      count: record.count,
      maxRequests,
      remainingRequests,
      windowMs
    });

    // Check if limit exceeded
    if (record.count > maxRequests) {
      logger.warn({
        msg: "Rate limit exceeded",
        key,
        count: record.count,
        maxRequests,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
      });

      res.status(429).json({
        error: "Too many requests",
        message,
        retryAfter: resetTimeInSeconds
      });
      return;
    }

    // Continue to next middleware
    next();
  };
};

/**
 * Rate limiter specifically for contact form submissions
 * More restrictive due to email sending costs and spam potential
 */
export const contactRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 submissions per 15 minutes per IP
  message: "Too many contact form submissions. Please wait before trying again."
});

/**
 * General API rate limiter
 * Less restrictive for general API usage
 */
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes per IP
  message: "Rate limit exceeded for API requests."
});

/**
 * Rate limiter specifically for newsletter subscriptions
 * More restrictive due to email sending costs and spam potential
 */
export const newsletterRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 subscriptions per 15 minutes per IP
  message: "Too many newsletter subscription attempts. Please wait before trying again."
});
