import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { requireApiKey, optionalApiKey, type AuthenticatedRequest } from "../middleware/auth";
import { authService } from "../services/auth";

// Mock logger to avoid console output during tests
jest.mock("../lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("AuthService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("authenticate", () => {
    it("should authenticate successfully with valid API key", () => {
      process.env.ADMIN_API_KEY = "test-api-key-12345";
      
      // Create new auth service instance to pick up env var
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate("test-api-key-12345");
      
      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: "admin-user",
        type: "admin",
      });
      expect(result.error).toBeUndefined();
    });

    it("should fail with invalid API key", () => {
      process.env.ADMIN_API_KEY = "correct-api-key";
      
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate("wrong-api-key");
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toBe("Invalid API key");
    });

    it("should fail when API key is not configured", () => {
      delete process.env.ADMIN_API_KEY;
      
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate("some-key");
      
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.error).toBe("Authentication service not properly configured");
    });

    it("should fail with non-string API key", () => {
      process.env.ADMIN_API_KEY = "test-key";
      
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate(null as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("API key is required and must be a string");
    });

    it("should fail with empty string API key", () => {
      process.env.ADMIN_API_KEY = "test-key";
      
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate("");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("API key is required and must be a string");
    });

    it("should use timing-safe comparison (different length keys)", () => {
      process.env.ADMIN_API_KEY = "short";
      
      const { authService: newAuthService } = require("../services/auth");
      
      const result = newAuthService.authenticate("much-longer-key");
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid API key");
    });
  });

  describe("isConfigured", () => {
    it("should return true when API key is configured", () => {
      process.env.ADMIN_API_KEY = "test-key";
      
      const { authService: newAuthService } = require("../services/auth");
      
      expect(newAuthService.isConfigured()).toBe(true);
    });

    it("should return false when API key is not configured", () => {
      delete process.env.ADMIN_API_KEY;
      
      const { authService: newAuthService } = require("../services/auth");
      
      expect(newAuthService.isConfigured()).toBe(false);
    });
  });

  describe("getApiKeyLength", () => {
    it("should return correct API key length", () => {
      process.env.ADMIN_API_KEY = "12345";
      
      const { authService: newAuthService } = require("../services/auth");
      
      expect(newAuthService.getApiKeyLength()).toBe(5);
    });
  });
});

describe("Authentication Middleware", () => {
  const originalEnv = process.env;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ADMIN_API_KEY: "test-api-key" };
    
    // Mock request object
    mockRequest = {
      headers: {},
      ip: "127.0.0.1",
      path: "/api/test",
      method: "GET",
      get: jest.fn(),
    };

    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("requireApiKey", () => {
    it("should call next() with valid API key", () => {
      mockRequest.headers!["x-api-key"] = "test-api-key";

      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({
        id: "admin-user",
        type: "admin",
      });
    });

    it("should return 401 when API key is missing", () => {
      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        details: "API key is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is invalid", () => {
      mockRequest.headers!["x-api-key"] = "wrong-key";

      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        details: "Invalid API key",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 500 when ADMIN_API_KEY is not configured", () => {
      delete process.env.ADMIN_API_KEY;
      
      // Re-import to pick up new environment
      jest.resetModules();
      const { requireApiKey: newRequireApiKey } = require("../middleware/auth");
      
      mockRequest.headers!["x-api-key"] = "some-key";

      newRequireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
        details: "Authentication service not properly configured",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when API key is not a string", () => {
      mockRequest.headers!["x-api-key"] = "12345";

      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        details: "API key is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle array API key header", () => {
      mockRequest.headers!["x-api-key"] = ["test-api-key"];

      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        details: "API key is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalApiKey", () => {
    it("should call next() and set user when API key is valid", () => {
      mockRequest.headers!["x-api-key"] = "test-api-key";

      optionalApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toEqual({
        id: "admin-user",
        type: "admin",
      });
    });

    it("should call next() without setting user when API key is missing", () => {
      optionalApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();
    });

    it("should call next() without setting user when API key is invalid", () => {
      mockRequest.headers!["x-api-key"] = "wrong-key";

      optionalApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();
    });

    it("should handle non-string API key gracefully", () => {
      mockRequest.headers!["x-api-key"] = "12345";

      optionalApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle exceptions and return 500", () => {
      // Mock authService to throw an error
      const originalAuthenticate = authService.authenticate;
      authService.authenticate = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      mockRequest.headers!["x-api-key"] = "test-api-key";

      requireApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
        details: "Authentication service error",
      });
      expect(mockNext).not.toHaveBeenCalled();

      // Restore original method
      authService.authenticate = originalAuthenticate;
    });

    it("should handle exceptions in optional auth and continue", () => {
      const originalAuthenticate = authService.authenticate;
      authService.authenticate = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      mockRequest.headers!["x-api-key"] = "test-api-key";

      optionalApiKey(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();

      // Restore original method
      authService.authenticate = originalAuthenticate;
    });
  });
});
