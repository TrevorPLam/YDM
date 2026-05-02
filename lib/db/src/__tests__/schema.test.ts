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
      // Verify enums are Drizzle enum objects (they are functions)
      expect(typeof blogPostStatusEnum).toBe('function');
      expect(typeof userRoleEnum).toBe('function');
    });
  });

  describe('Basic Schema Validation', () => {
    it('should be able to access table properties without errors', () => {
      // Test that we can access basic table properties without errors
      expect(() => {
        const tables = [industries, blogPosts, contacts, newsletterSubscriptions, users];
        return tables;
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
    it('should export Zod schemas for all tables', async () => {
      // Test that Zod schemas are exported by importing them directly
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
      } = await import('../schema');
      
      expect(insertIndustrySchema).toBeDefined();
      expect(selectIndustrySchema).toBeDefined();
      expect(insertBlogPostSchema).toBeDefined();
      expect(selectBlogPostSchema).toBeDefined();
      expect(insertContactSchema).toBeDefined();
      expect(selectContactSchema).toBeDefined();
      expect(insertNewsletterSubscriptionSchema).toBeDefined();
      expect(selectNewsletterSubscriptionSchema).toBeDefined();
      expect(insertUserSchema).toBeDefined();
      expect(selectUserSchema).toBeDefined();
    });
  });

  describe('Table Structure Validation', () => {
    it('should validate industries table has expected columns', () => {
      const table = industries as any;
      
      // Check table object exists and has expected properties
      expect(table).toBeDefined();
      expect(typeof table).toBe('object');
      
      // Verify required columns exist by checking table definition structure
      expect(table.id).toBeDefined();
      expect(table.publicId).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.slug).toBeDefined();
      expect(table.description).toBeDefined();
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should validate blog_posts table has expected columns', () => {
      const table = blogPosts as any;
      
      // Check table object exists and has expected properties
      expect(table).toBeDefined();
      expect(typeof table).toBe('object');
      
      // Verify required columns exist
      expect(table.id).toBeDefined();
      expect(table.publicId).toBeDefined();
      expect(table.authorId).toBeDefined();
      expect(table.industryId).toBeDefined();
      expect(table.title).toBeDefined();
      expect(table.slug).toBeDefined();
      expect(table.content).toBeDefined();
      expect(table.status).toBeDefined();
      expect(table.isFeatured).toBeDefined();
      expect(table.metaDescription).toBeDefined();
      expect(table.publishedAt).toBeDefined();
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should validate contacts table has expected columns', () => {
      const table = contacts as any;
      
      // Check table object exists and has expected properties
      expect(table).toBeDefined();
      expect(typeof table).toBe('object');
      
      // Verify required columns exist
      expect(table.id).toBeDefined();
      expect(table.publicId).toBeDefined();
      expect(table.fullName).toBeDefined();
      expect(table.email).toBeDefined();
      expect(table.company).toBeDefined();
      expect(table.message).toBeDefined();
      expect(table.phone).toBeDefined();
      expect(table.source).toBeDefined();
      expect(table.status).toBeDefined();
      expect(table.notes).toBeDefined();
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should validate newsletter_subscriptions table has expected columns', () => {
      const table = newsletterSubscriptions as any;
      
      // Check table object exists and has expected properties
      expect(table).toBeDefined();
      expect(typeof table).toBe('object');
      
      // Verify required columns exist
      expect(table.id).toBeDefined();
      expect(table.publicId).toBeDefined();
      expect(table.email).toBeDefined();
      expect(table.firstName).toBeDefined();
      expect(table.lastName).toBeDefined();
      expect(table.isActive).toBeDefined();
      expect(table.source).toBeDefined();
      expect(table.unsubscribeReason).toBeDefined();
      expect(table.unsubscribedAt).toBeDefined();
      expect(table.preferences).toBeDefined();
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should validate users table has expected columns', () => {
      const table = users as any;
      
      // Check table object exists and has expected properties
      expect(table).toBeDefined();
      expect(typeof table).toBe('object');
      
      // Verify required columns exist
      expect(table.id).toBeDefined();
      expect(table.publicId).toBeDefined();
      expect(table.email).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.role).toBeDefined();
      expect(table.preferences).toBeDefined();
      expect(table.isActive).toBeDefined();
      expect(table.lastLoginAt).toBeDefined();
      expect(table.passwordHash).toBeDefined();
      expect(table.isEmailVerified).toBeDefined();
      expect(table.emailVerifiedAt).toBeDefined();
      expect(table.avatarUrl).toBeDefined();
      expect(table.bio).toBeDefined();
      expect(table.createdAt).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });
  });

  describe('Enum Validation', () => {
    it('should validate blog_post_status enum values', () => {
      const enumObj = blogPostStatusEnum as any;
      expect(enumObj.enumValues).toEqual(['draft', 'published', 'archived']);
    });

    it('should validate user_role enum values', () => {
      const enumObj = userRoleEnum as any;
      expect(enumObj.enumValues).toEqual(['admin', 'user', 'moderator']);
    });
  });

  describe('Schema Consistency', () => {
    it('should have consistent column patterns across all tables', () => {
      const tables = [industries, blogPosts, contacts, newsletterSubscriptions, users] as any[];
      
      tables.forEach(table => {
        // All tables should have these common columns
        expect(table.id).toBeDefined();
        expect(table.publicId).toBeDefined();
        expect(table.createdAt).toBeDefined();
        expect(table.updatedAt).toBeDefined();
      });
    });

    it('should have proper table structure for all bounded contexts', () => {
      // Content Management context
      expect(industries).toBeDefined();
      expect(blogPosts).toBeDefined();
      
      // Communication context
      expect(contacts).toBeDefined();
      expect(newsletterSubscriptions).toBeDefined();
      
      // Identity & Access context
      expect(users).toBeDefined();
    });
  });
});
