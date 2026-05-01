import { pgTable, pgEnum, integer, varchar, text, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// User role enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'moderator']);

// Reusable timestamp pattern
const timestamps = {
  createdAt: text('created_at').default('now()').notNull(),
  updatedAt: text('updated_at').default('now()').notNull(),
};

// Users table - part of Identity & Access bounded context
export const users = pgTable('users', {
  // Internal ID for performance
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  
  // Public-facing ID for URLs and APIs
  publicId: varchar('public_id', { length: 12 }).unique().notNull(),
  
  // Email address (unique)
  email: varchar('email', { length: 320 }).notNull(),
  
  // Full name
  name: varchar('name', { length: 255 }).notNull(),
  
  // User role
  role: userRoleEnum('role').default('user').notNull(),
  
  // User preferences (JSON for extensibility)
  preferences: jsonb('preferences').$type<{
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  }>(),
  
  // Account status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Last login timestamp
  lastLoginAt: text('last_login_at'),
  
  // Password hash (for future authentication)
  passwordHash: varchar('password_hash', { length: 255 }),
  
  // Email verification status
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  
  // Email verification timestamp
  emailVerifiedAt: text('email_verified_at'),
  
  // Profile avatar URL
  avatarUrl: varchar('avatar_url', { length: 500 }),
  
  // Bio/description
  bio: text('bio'),
  
  // Timestamps
  ...timestamps,
}, (table) => [
  // Unique constraint on email
  uniqueIndex('users_email_unique').on(table.email),
  
  // Index for role filtering
  index('users_role_idx').on(table.role),
  
  // Index for active status
  index('users_active_idx').on(table.isActive),
  
  // Index for public ID lookups
  index('users_public_id_idx').on(table.publicId),
  
  // Composite index for active users by role
  index('users_active_role_idx').on(table.isActive, table.role),
  
  // Index for last login tracking
  index('users_last_login_idx').on(table.lastLoginAt.desc()),
]);

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(2, 'Name must be at least 2 characters').max(255, 'Name must be less than 255 characters'),
  email: (schema) => schema.email('Invalid email format'),
  role: (schema) => schema,
  preferences: (schema) => schema.optional(),
  avatarUrl: (schema) => schema.url('Invalid avatar URL').optional(),
  bio: (schema) => schema.max(1000, 'Bio must be less than 1000 characters').optional(),
  passwordHash: (schema) => schema.min(8, 'Password hash must be at least 8 characters').optional(),
}).refine((data) => {
  // Custom validation: email verification requires timestamp
  if (data.isEmailVerified && !data.emailVerifiedAt) {
    return false;
  }
  return true;
}, {
  message: 'Verified emails must have verification timestamp',
  path: ['emailVerifiedAt'],
}) as unknown as z.ZodType<any, any, any>;

export const selectUserSchema = createSelectSchema(users) as unknown as z.ZodType<any, any, any>;

// Type inference from Zod schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
