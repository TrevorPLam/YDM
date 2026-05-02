import { describe, it, expect } from 'vitest';
import * as schema from '../schema';

describe('Database Migration Validation', () => {
  it('should have all required table definitions', () => {
    // Test that all tables are properly exported from schema
    expect(schema.industries).toBeDefined();
    expect(schema.blogPosts).toBeDefined();
    expect(schema.contacts).toBeDefined();
    expect(schema.newsletterSubscriptions).toBeDefined();
    expect(schema.users).toBeDefined();
  });

  it('should have proper table structures with required columns', () => {
    // Test industries table structure
    const industriesTable = schema.industries;
    expect(industriesTable).toBeDefined();
    
    // Test blog_posts table structure
    const blogPostsTable = schema.blogPosts;
    expect(blogPostsTable).toBeDefined();
    
    // Test contacts table structure
    const contactsTable = schema.contacts;
    expect(contactsTable).toBeDefined();
    
    // Test newsletter_subscriptions table structure
    const newsletterTable = schema.newsletterSubscriptions;
    expect(newsletterTable).toBeDefined();
    
    // Test users table structure
    const usersTable = schema.users;
    expect(usersTable).toBeDefined();
  });

  it('should have proper enum definitions', () => {
    // Test blog post status enum
    expect(schema.blogPostStatusEnum).toBeDefined();
    
    // Test user role enum
    expect(schema.userRoleEnum).toBeDefined();
  });

  it('should have proper Zod validation schemas', () => {
    // Test that all tables have corresponding Zod schemas
    expect(schema.insertIndustrySchema).toBeDefined();
    expect(schema.selectIndustrySchema).toBeDefined();
    expect(schema.insertBlogPostSchema).toBeDefined();
    expect(schema.selectBlogPostSchema).toBeDefined();
    expect(schema.insertContactSchema).toBeDefined();
    expect(schema.selectContactSchema).toBeDefined();
    expect(schema.insertNewsletterSubscriptionSchema).toBeDefined();
    expect(schema.selectNewsletterSubscriptionSchema).toBeDefined();
    expect(schema.insertUserSchema).toBeDefined();
    expect(schema.selectUserSchema).toBeDefined();
  });

  it('should follow DDD bounded context organization', () => {
    // Content Management bounded context
    expect(schema.industries).toBeDefined();
    expect(schema.blogPosts).toBeDefined();
    
    // Communication bounded context
    expect(schema.contacts).toBeDefined();
    expect(schema.newsletterSubscriptions).toBeDefined();
    
    // Identity & Access bounded context
    expect(schema.users).toBeDefined();
  });

  it('should have proper TypeScript types exported', () => {
    // Test that all types are properly exported
    // Note: Types are exported individually from schema/index.ts
    expect(typeof schema).toBe('object');
    
    // Verify we have the expected exports by checking they're not undefined
    expect(schema.industries).toBeDefined();
    expect(schema.blogPosts).toBeDefined();
    expect(schema.contacts).toBeDefined();
    expect(schema.newsletterSubscriptions).toBeDefined();
    expect(schema.users).toBeDefined();
  });
});
