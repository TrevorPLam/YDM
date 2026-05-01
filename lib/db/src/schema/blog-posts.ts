import { pgTable, pgEnum, integer, varchar, text, index, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { industries } from './industries';

// Blog post status enum
export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'archived']);

// Reusable timestamp pattern
const timestamps = {
  createdAt: text('created_at').default('now()').notNull(),
  updatedAt: text('updated_at').default('now()').notNull(),
};

// BlogPosts table - part of Content Management bounded context
export const blogPosts = pgTable('blog_posts', {
  // Internal ID for performance
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Public-facing ID for URLs and APIs
  publicId: varchar('public_id', { length: 12 }).unique().notNull(),
  
  // Foreign key to author (user) - will be added when users table exists
  authorId: integer('author_id').notNull(),
  
  // Foreign key to industry
  industryId: integer('industry_id').references(() => industries.id, { 
    onDelete: 'restrict', // Don't allow deleting industries with blog posts
    onUpdate: 'cascade' 
  }).notNull(),
  
  // Blog post title
  title: varchar('title', { length: 255 }).notNull(),
  
  // URL-friendly identifier
  slug: varchar('slug', { length: 255 }).notNull(),
  
  // Blog content (rich text)
  content: text('content').notNull(),
  
  // Publication status
  status: blogPostStatusEnum('status').default('draft').notNull(),
  
  // Featured post flag
  isFeatured: boolean('is_featured').default(false).notNull(),
  
  // SEO meta description
  metaDescription: varchar('meta_description', { length: 160 }),
  
  // Publication timestamp (null until published)
  publishedAt: text('published_at'),
  
  // Timestamps
  ...timestamps,
}, (table) => [
  // Index for slug uniqueness within published posts
  index('blog_posts_slug_idx').on(table.slug),
  
  // Index for author lookups
  index('blog_posts_author_idx').on(table.authorId),
  
  // Index for industry filtering
  index('blog_posts_industry_idx').on(table.industryId),
  
  // Index for published posts
  index('blog_posts_published_idx').on(table.publishedAt),
  
  // Index for featured posts
  index('blog_posts_featured_idx').on(table.isFeatured),
  
  // Composite index for industry + published posts
  index('blog_posts_industry_published_idx').on(table.industryId, table.publishedAt),
]);

// Zod schemas for validation
export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  title: (schema) => schema.min(5, 'Title must be at least 5 characters').max(255, 'Title must be less than 255 characters'),
  slug: (schema) => schema.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: (schema) => schema.min(50, 'Content must be at least 50 characters'),
  metaDescription: (schema) => schema.max(160, 'Meta description must be less than 160 characters').optional(),
}).refine((data) => {
  // Custom validation: published posts must have publishedAt
  if (data.status === 'published' && !data.publishedAt) {
    return false;
  }
  return true;
}, {
  message: 'Published posts must have a publication date',
  path: ['publishedAt'],
}) as unknown as z.ZodType<any, any, any>;

export const selectBlogPostSchema = createSelectSchema(blogPosts) as unknown as z.ZodType<any, any, any>;

// Type inference from Zod schemas
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = z.infer<typeof selectBlogPostSchema>;
