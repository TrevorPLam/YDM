import { createHash, timingSafeEqual } from "crypto";
import { logger } from "../lib/logger";

/**
 * Authentication Service
 * 
 * Provides secure authentication operations using timing-safe comparisons
 * and proper secret management. Follows security best practices for API key validation.
 * 
 * This service belongs to the Identity & Access bounded context and provides
 * a simple interface that hides authentication implementation details.
 */

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    type: "admin";
  };
  error?: string;
}

/**
 * Authentication Service Class
 * 
 * Handles API key authentication using timing-safe comparisons to prevent
 * timing attacks. Uses environment variables for secret management.
 */
export class AuthService {
  private readonly adminApiKey: string;

  constructor() {
    // Get API key from environment at construction time
    this.adminApiKey = process.env.ADMIN_API_KEY || "";

    if (!this.adminApiKey) {
      logger.error({
        msg: "AuthService initialization failed: ADMIN_API_KEY not set",
      });
    } else {
      logger.info({
        msg: "AuthService initialized successfully",
        apiKeyLength: this.adminApiKey.length,
      });
    }
  }

  /**
   * Timing-safe API key comparison
   * 
   * Uses timingSafeEqual to prevent timing attacks that could leak
   * information about the API key through response time differences.
   * 
   * @param providedKey The API key provided in the request
   * @returns boolean indicating if the keys match
   */
  private timingSafeApiKeyCompare(providedKey: string): boolean {
    // If no admin API key is configured, always fail
    if (!this.adminApiKey) {
      return false;
    }

    // If provided key is not a string, fail
    if (typeof providedKey !== "string") {
      return false;
    }

    // Convert to buffers for timing-safe comparison
    const adminKeyBuffer = Buffer.from(this.adminApiKey, "utf8");
    const providedKeyBuffer = Buffer.from(providedKey, "utf8");

    // Buffers must be the same length for timingSafeEqual
    if (adminKeyBuffer.length !== providedKeyBuffer.length) {
      return false;
    }

    // Use timing-safe comparison
    return timingSafeEqual(adminKeyBuffer, providedKeyBuffer);
  }

  /**
   * Authenticate using API key
   * 
   * Validates the provided API key using timing-safe comparison and returns
   * authentication result with user information if successful.
   * 
   * @param apiKey The API key to validate
   * @returns AuthResult with success status and user information
   */
  public authenticate(apiKey: string): AuthResult {
    // Validate input
    if (!apiKey || typeof apiKey !== "string") {
      logger.warn({
        msg: "Authentication failed: Invalid API key format",
        keyType: typeof apiKey,
        keyProvided: !!apiKey,
      });

      return {
        success: false,
        error: "API key is required and must be a string",
      };
    }

    // Check if admin API key is configured
    if (!this.adminApiKey) {
      logger.error({
        msg: "Authentication failed: ADMIN_API_KEY not configured",
      });

      return {
        success: false,
        error: "Authentication service not properly configured",
      };
    }

    // Perform timing-safe validation
    const isValid = this.timingSafeApiKeyCompare(apiKey);

    if (!isValid) {
      logger.warn({
        msg: "Authentication failed: Invalid API key",
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 8) + "...", // Log prefix for debugging
      });

      return {
        success: false,
        error: "Invalid API key",
      };
    }

    // Authentication successful
    logger.info({
      msg: "Authentication successful",
      keyLength: apiKey.length,
    });

    return {
      success: true,
      user: {
        id: "admin-user",
        type: "admin",
      },
    };
  }

  /**
   * Check if the service is properly configured
   * 
   * @returns boolean indicating if the service has a valid API key configured
   */
  public isConfigured(): boolean {
    return !!this.adminApiKey;
  }

  /**
   * Get the configured API key length (for validation purposes)
   * 
   * @returns number indicating expected API key length
   */
  public getApiKeyLength(): number {
    return this.adminApiKey.length;
  }
}

// Export singleton instance
export const authService = new AuthService();
