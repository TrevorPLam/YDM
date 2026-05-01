import { pgTable, integer, varchar, text, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Reusable timestamp pattern
const timestamps = {
  createdAt: text('created_at').default('now()').notNull(),
  updatedAt: text('updated_at').default('now()').notNull(),
};

// Contacts table - part of Communication bounded context
export const contacts = pgTable('contacts', {
  // Internal ID for performance
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Public-facing ID for URLs and APIs
  publicId: varchar('public_id', { length: 12 }).unique().notNull(),
  
  // Contact full name
  fullName: varchar('full_name', { length: 255 }).notNull(),
  
  // Email address (unique for contact tracking)
  email: varchar('email', { length: 320 }).notNull(),
  
  // Company name (optional)
  company: varchar('company', { length: 255 }),
  
  // Contact message
  message: text('message').notNull(),
  
  // Phone number (optional)
  phone: varchar('phone', { length: 50 }),
  
  // Contact source (e.g., 'website', 'referral', 'direct')
  source: varchar('source', { length: 50 }).default('website').notNull(),
  
  // Contact status (new, contacted, qualified, closed)
  status: varchar('status', { length: 50 }).default('new').notNull(),
  
  // Notes for internal use
  notes: text('notes'),
  
  // Timestamps
  ...timestamps,
}, (table) => [
  // Index for email lookups (primary contact identifier)
  index('contacts_email_idx').on(table.email),
  
  // Index for status filtering
  index('contacts_status_idx').on(table.status),
  
  // Index for source tracking
  index('contacts_source_idx').on(table.source),
  
  // Index for public ID lookups
  index('contacts_public_id_idx').on(table.publicId),
  
  // Composite index for status + created_at for workflow management
  index('contacts_status_created_idx').on(table.status, table.createdAt.desc()),
]);

// Zod schemas for validation
export const insertContactSchema = createInsertSchema(contacts, {
  fullName: (schema) => schema.min(2, 'Full name must be at least 2 characters').max(255, 'Full name must be less than 255 characters'),
  email: (schema) => schema.email('Invalid email format'),
  message: (schema) => schema.min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
  company: (schema) => schema.max(255, 'Company name must be less than 255 characters').optional(),
  phone: (schema) => schema.regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  source: (schema) => schema.max(50, 'Source must be less than 50 characters'),
  status: (schema) => schema.max(50, 'Status must be less than 50 characters'),
  notes: (schema) => schema.max(2000, 'Notes must be less than 2000 characters').optional(),
}) as unknown as z.ZodType<any, any, any>;

export const selectContactSchema = createSelectSchema(contacts) as unknown as z.ZodType<any, any, any>;

// Type inference from Zod schemas
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = z.infer<typeof selectContactSchema>;
