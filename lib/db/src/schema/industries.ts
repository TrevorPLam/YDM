import { pgTable, integer, varchar, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Reusable timestamp pattern
const timestamps = {
  createdAt: text('created_at').default('now()').notNull(),
  updatedAt: text('updated_at').default('now()').notNull(),
};

// Industries table - part of Content Management bounded context
export const industries = pgTable('industries', {
  // Internal ID for performance
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Public-facing ID for URLs and APIs
  publicId: varchar('public_id', { length: 12 }).unique().notNull(),
  
  // Industry name (human-readable)
  name: varchar('name', { length: 100 }).notNull(),
  
  // URL-friendly identifier
  slug: varchar('slug', { length: 100 }).notNull(),
  
  // Detailed description
  description: text('description'),
  
  // Timestamps
  ...timestamps,
}, (table) => [
  // Unique constraint on slug for URL uniqueness
  uniqueIndex('industries_slug_unique').on(table.slug),
  
  // Index for name searches
  index('industries_name_idx').on(table.name),
  
  // Index for public ID lookups
  index('industries_public_id_idx').on(table.publicId),
]);

// Zod schemas for validation
export const insertIndustrySchema = createInsertSchema(industries, {
  name: (schema) => schema.min(2, 'Industry name must be at least 2 characters'),
  slug: (schema) => schema.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: (schema) => schema.optional(),
}) as unknown as z.ZodType<any, any, any>;

export const selectIndustrySchema = createSelectSchema(industries) as unknown as z.ZodType<any, any, any>;

// Type inference from Zod schemas
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = z.infer<typeof selectIndustrySchema>;
