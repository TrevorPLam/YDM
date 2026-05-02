import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Security Headers Middleware
 * 
 * Sets security-related HTTP headers to protect against common web vulnerabilities.
 * Follows OWASP security best practices and modern security standards.
 * 
 * This middleware provides equivalent functionality to Helmet.js but implemented
 * manually to avoid additional dependencies and maintain full control.
 */

export interface SecurityHeadersOptions {
  // Content Security Policy
  contentSecurityPolicy?: {
    directives?: {
      [key: string]: string[];
    };
    reportOnly?: boolean;
  };

  // Transport Security
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  // Other security headers
  xContentTypeOptions?: boolean;
  xFrameOptions?: string; // DENY, SAMEORIGIN, ALLOW-FROM
  referrerPolicy?: string;
  permissionsPolicy?: {
    [key: string]: boolean;
  };
}

const defaultOptions: SecurityHeadersOptions = {
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"], // Allow inline styles for Tailwind
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'"],
      "font-src": ["'self'"],
      "object-src": ["'none'"],
      "media-src": ["'self'"],
      "frame-src": ["'none'"],
      "child-src": ["'none'"],
      "worker-src": ["'none'"],
      "manifest-src": ["'self'"],
      "upgrade-insecure-requests": [],
    },
    reportOnly: false,
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: false, // Set to true only if all subdomains support HTTPS
    preload: false, // Only set to true if submitted to HSTS preload list
  },
  xContentTypeOptions: true,
  xFrameOptions: "DENY",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: {
    "geolocation": false,
    "microphone": false,
    "camera": false,
    "payment": false,
    "usb": false,
    "magnetometer": false,
    "gyroscope": false,
    "accelerometer": false,
  },
};

/**
 * Build Content Security Policy header value
 */
const buildCSPHeader = (options: SecurityHeadersOptions["contentSecurityPolicy"]): string => {
  if (!options?.directives) {
    return "";
  }

  const directives = Object.entries(options.directives)
    .map(([directive, values]) => {
      const valueString = values.join(" ");
      return `${directive} ${valueString}`;
    })
    .join("; ");

  return directives;
};

/**
 * Build HSTS header value
 */
const buildHSTSHeader = (options: SecurityHeadersOptions["hsts"]): string => {
  if (!options) {
    return "";
  }

  const parts = [`max-age=${options.maxAge || 31536000}`];
  
  if (options.includeSubDomains) {
    parts.push("includeSubDomains");
  }
  
  if (options.preload) {
    parts.push("preload");
  }

  return parts.join("; ");
};

/**
 * Build Permissions Policy header value
 */
const buildPermissionsPolicyHeader = (options: SecurityHeadersOptions["permissionsPolicy"]): string => {
  if (!options) {
    return "";
  }

  const policies = Object.entries(options)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => `${feature}=()`)
    .join(", ");

  return policies;
};

/**
 * Security Headers Middleware Factory
 * 
 * Returns a middleware function that sets security headers based on provided options.
 */
export const securityHeaders = (userOptions: Partial<SecurityHeadersOptions> = {}) => {
  const options = { ...defaultOptions, ...userOptions };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Content Security Policy
      if (options.contentSecurityPolicy) {
        const cspValue = buildCSPHeader(options.contentSecurityPolicy);
        const headerName = options.contentSecurityPolicy.reportOnly 
          ? "Content-Security-Policy-Report-Only" 
          : "Content-Security-Policy";
        
        if (cspValue) {
          res.set(headerName, cspValue);
        }
      }

      // HTTP Strict Transport Security (HSTS)
      if (options.hsts) {
        const hstsValue = buildHSTSHeader(options.hsts);
        if (hstsValue) {
          res.set("Strict-Transport-Security", hstsValue);
        }
      }

      // X-Content-Type-Options
      if (options.xContentTypeOptions) {
        res.set("X-Content-Type-Options", "nosniff");
      }

      // X-Frame-Options
      if (options.xFrameOptions) {
        res.set("X-Frame-Options", options.xFrameOptions);
      }

      // Referrer Policy
      if (options.referrerPolicy) {
        res.set("Referrer-Policy", options.referrerPolicy);
      }

      // Permissions Policy (formerly Feature Policy)
      if (options.permissionsPolicy) {
        const permissionsValue = buildPermissionsPolicyHeader(options.permissionsPolicy);
        if (permissionsValue) {
          res.set("Permissions-Policy", permissionsValue);
        }
      }

      // Additional security headers
      res.set("X-DNS-Prefetch-Control", "off");
      res.set("X-Download-Options", "noopen");
      res.set("X-Permitted-Cross-Domain-Policies", "none");
      res.set("X-XSS-Protection", "1; mode=block"); // Legacy but still useful
      res.set("Cross-Origin-Embedder-Policy", "require-corp");
      res.set("Cross-Origin-Opener-Policy", "same-origin");
      res.set("Cross-Origin-Resource-Policy", "same-origin");

      // Remove server information
      res.removeHeader("Server");
      res.set("Server", "");

      logger.info({
        msg: "Security headers set",
        path: req.path,
        method: req.method,
      });

      next();
    } catch (error) {
      logger.error({
        msg: "Security headers middleware error",
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
        method: req.method,
      });

      // Continue even on error - security headers should not break the application
      next();
    }
  };
};

/**
 * Default security headers middleware with recommended settings
 */
export const defaultSecurityHeaders = securityHeaders(defaultOptions);

/**
 * Relaxed security headers for development
 * Less strict CSP to allow development tools and hot reload
 */
export const developmentSecurityHeaders = securityHeaders({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-eval'"], // Allow eval for dev tools
      "style-src": ["'self'", "'unsafe-inline'"], // Allow inline styles
      "img-src": ["'self'", "data:", "https:", "blob:"], // Allow blob URLs for dev
      "connect-src": ["'self'", "ws:", "wss:"], // Allow WebSocket connections
    },
    reportOnly: false,
  },
  hsts: {
    maxAge: 0, // Disable HSTS in development
    includeSubDomains: false,
    preload: false,
  },
  xFrameOptions: "SAMEORIGIN", // Less restrictive for development
  referrerPolicy: "no-referrer-when-downgrade",
});
