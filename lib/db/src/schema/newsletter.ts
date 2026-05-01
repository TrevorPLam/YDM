import { pgTable, integer, varchar, text, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Reusable timestamp pattern
const timestamps = {
  createdAt: text('created_at').default('now()').notNull(),
  updatedAt: text('updated_at').default('now()').notNull(),
};

// Newsletter subscriptions table - part of Communication bounded context
export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  // Internal ID for performance
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Public-facing ID for URLs and APIs
  publicId: varchar('public_id', { length: 12 }).unique().notNull(),
  
  // Email address (unique constraint for active subscriptions)
  email: varchar('email', { length: 320 }).notNull(),
  
  // First name (optional)
  firstName: varchar('first_name', { length: 100 }),
  
  // Last name (optional)
  lastName: varchar('last_name', { length: 100 }),
  
  // Subscription status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Subscription source (e.g., 'footer', 'blog', 'popup')
  source: varchar('source', { length: 50 }).default('footer').notNull(),
  
  // Unsubscribe reason (when applicable)
  unsubscribeReason: varchar('unsubscribe_reason', { length: 255 }),
  
  // Unsubscribe timestamp
  unsubscribedAt: text('unsubscribed_at'),
  
  // Preferences (JSON for future extensibility)
  preferences: text('preferences'), // JSON string for preferences
  
  // Timestamps
  ...timestamps,
}, (table) => [
  // Unique constraint on email for active subscriptions
  uniqueIndex('newsletter_active_email_unique').on(table.email),
  
  // Index for email lookups
  index('newsletter_email_idx').on(table.email),
  
  // Index for active status filtering
  index('newsletter_active_idx').on(table.isActive),
  
  // Index for source tracking
  index('newsletter_source_idx').on(table.source),
  
  // Index for public ID lookups
  index('newsletter_public_id_idx').on(table.publicId),
  
  // Composite index for active subscriptions by date
  index('newsletter_active_created_idx').on(table.isActive, table.createdAt),
]);

// Zod schemas for validation
export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions, {
  email: (schema) => schema.email('Invalid email format'),
  firstName: (schema) => schema.max(100, 'First name must be less than 100 characters').optional(),
  lastName: (schema) => schema.max(100, 'Last name must be less than 100 characters').optional(),
  source: (schema) => schema.max(50, 'Source must be less than 50 characters'),
  unsubscribeReason: (schema) => schema.max(255, 'Unsubscribe reason must be less than 255 characters').optional(),
  preferences: (schema) => schema.optional(),
}) as unknown as z.ZodType<any, any, any>;

export const selectNewsletterSubscriptionSchema = createSelectSchema(newsletterSubscriptions) as unknown as z.ZodType<any, any, any>;

// Type inference from Zod schemas
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = z.infer<typeof selectNewsletterSubscriptionSchema>;
