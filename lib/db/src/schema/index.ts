// Export all database tables and schemas
// Each model/table is split into separate files following domain boundaries

// Content Management bounded context
export * from "./industries";
export * from "./blog-posts";

// Communication bounded context  
export * from "./contacts";
export * from "./newsletter";

// Identity & Access bounded context
export * from "./users";

// Re-export all tables for easy import
export { industries } from "./industries";
export { blogPosts } from "./blog-posts";
export { contacts } from "./contacts";
export { newsletterSubscriptions } from "./newsletter";
export { users } from "./users";

// Re-export all enums
export { blogPostStatusEnum } from "./blog-posts";
export { userRoleEnum } from "./users";

// Re-export all types (Zod schemas temporarily disabled due to type compatibility)
export {
  type InsertIndustry,
  type Industry,
} from "./industries";

export {
  type InsertBlogPost,
  type BlogPost,
} from "./blog-posts";

export {
  type InsertContact,
  type Contact,
} from "./contacts";

export {
  type InsertNewsletterSubscription,
  type NewsletterSubscription,
} from "./newsletter";

export {
  type InsertUser,
  type User,
} from "./users";