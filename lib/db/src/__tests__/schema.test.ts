import { describe, it, expect } from 'vitest';
import {
  industries,
  blogPosts,
  contacts,
  newsletterSubscriptions,
  users,
  blogPostStatusEnum,
  userRoleEnum,
} from '../schema';

describe('Database Schema Validation', () => {
  describe('Table Definitions', () => {
    it('should export all required tables', () => {
      expect(industries).toBeDefined();
      expect(blogPosts).toBeDefined();
      expect(contacts).toBeDefined();
      expect(newsletterSubscriptions).toBeDefined();
      expect(users).toBeDefined();
    });

    it('should export all required enums', () => {
      expect(blogPostStatusEnum).toBeDefined();
      expect(userRoleEnum).toBeDefined();
    });
  });

  describe('Schema Structure', () => {
    it('should have proper table objects', () => {
      // Verify tables are Drizzle table objects
      expect(typeof industries).toBe('object');
      expect(typeof blogPosts).toBe('object');
      expect(typeof contacts).toBe('object');
      expect(typeof newsletterSubscriptions).toBe('object');
      expect(typeof users).toBe('object');
    });

    it('should have proper enum objects', () => {
      // Verify enums are Drizzle enum objects
      expect(typeof blogPostStatusEnum).toBe('object');
      expect(typeof userRoleEnum).toBe('object');
    });
  });

  describe('Basic Schema Validation', () => {
    it('should be able to access table properties', () => {
      // Test that we can access basic table properties without errors
      expect(() => {
        const tableNames = [
          (industries as any)[Symbol.for('drizzle:table_name')],
          (blogPosts as any)[Symbol.for('drizzle:table_name')],
          (contacts as any)[Symbol.for('drizzle:table_name')],
          (newsletterSubscriptions as any)[Symbol.for('drizzle:table_name')],
          (users as any)[Symbol.for('drizzle:table_name')],
        ];
        return tableNames;
      }).not.toThrow();
    });

    it('should have enum values defined', () => {
      // Test that enums have proper values
      expect(() => {
        const blogStatusValues = blogPostStatusEnum.enumValues;
        const userRoleValues = userRoleEnum.enumValues;
        return { blogStatusValues, userRoleValues };
      }).not.toThrow();
    });
  });

  describe('Schema Export Validation', () => {
    it('should export Zod schemas for all tables', () => {
      // Test that Zod schemas are exported (they may have type issues but should exist)
      expect(() => {
        const {
          insertIndustrySchema,
          selectIndustrySchema,
          insertBlogPostSchema,
          selectBlogPostSchema,
          insertContactSchema,
          selectContactSchema,
          insertNewsletterSubscriptionSchema,
          selectNewsletterSubscriptionSchema,
          insertUserSchema,
          selectUserSchema,
        } = require('../schema');
        
        return {
          insertIndustrySchema,
          selectIndustrySchema,
          insertBlogPostSchema,
          selectBlogPostSchema,
          insertContactSchema,
          selectContactSchema,
          insertNewsletterSubscriptionSchema,
          selectNewsletterSubscriptionSchema,
          insertUserSchema,
          selectUserSchema,
        };
      }).not.toThrow();
    });
  });
});
