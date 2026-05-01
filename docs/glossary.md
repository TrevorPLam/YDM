# Domain Glossary

## Overview

This document defines the ubiquitous language for the YDM (Nexus Digital) project. All code, database schemas, APIs, and documentation must use these terms consistently.

## Bounded Contexts

### Content Management
Entities related to content creation and organization.

### Communication  
Entities related to user interactions and messaging.

## Core Entities

### Industry
**Definition:** A business sector or category that the company serves.  
**Attributes:** name, slug, description  
**Examples:** "Technology", "Healthcare", "Finance"  
**Usage:** Used to categorize blog posts and showcase expertise areas.

### BlogPost
**Definition:** A published article or content piece.  
**Attributes:** title, slug, content, status, publishedAt, authorId  
**States:** draft → published → archived  
**Usage:** Primary content marketing vehicle.

### ContactSubmission
**Definition:** A message from a potential customer or visitor.  
**Attributes:** fullName, email, company, message, submittedAt  
**Usage:** Lead generation and customer communication.

### NewsletterSubscription
**Definition:** A user's subscription to receive email newsletters.  
**Attributes:** email, subscribedAt, unsubscribedAt, isActive  
**Usage:** Email marketing and audience engagement.

### User
**Definition:** A person with access to the admin system.  
**Attributes:** email, name, role, preferences, isActive  
**Roles:** admin, user, moderator  
**Usage:** Content management and system administration.

## Attribute Definitions

### Common Attributes

#### id
**Definition:** Internal system identifier (integer).  
**Type:** Integer with identity generation  
**Usage:** Database relationships and internal operations.

#### publicId  
**Definition:** External-facing identifier for URLs and APIs.  
**Type:** String (12 characters, nanoid)  
**Usage:** Public URLs, API references, security.

#### createdAt
**Definition:** Timestamp when the entity was created.  
**Type:** Timestamp with timezone  
**Usage:** Auditing and chronological ordering.

#### updatedAt
**Definition:** Timestamp when the entity was last modified.  
**Type:** Timestamp with timezone  
**Usage:** Change tracking and cache invalidation.

#### slug
**Definition:** URL-friendly identifier derived from name.  
**Type:** String (lowercase, hyphens)  
**Usage:** SEO-friendly URLs and references.

### Entity-Specific Attributes

#### status (BlogPost)
**Values:** draft, published, archived  
**Default:** draft  
**Usage:** Content publication workflow.

#### role (User)
**Values:** admin, user, moderator  
**Default:** user  
**Usage:** Access control and permissions.

#### isActive (NewsletterSubscription, User)
**Type:** Boolean  
**Default:** true  
**Usage:** Soft deletion and subscription management.

## Relationships

### BlogPost → User (Author)
**Type:** Many-to-One  
**Description:** Each blog post has one author (user).  
**Foreign Key:** blog_posts.authorId → users.id

### BlogPost → Industry
**Type:** Many-to-One  
**Description:** Each blog post belongs to one industry.  
**Foreign Key:** blog_posts.industryId → industries.id

## Naming Conventions

### Database Tables
- **Format:** PascalCase  
- **Examples:** Users, BlogPosts, Industries, Contacts, NewsletterSubscriptions

### Database Columns
- **Format:** snake_case  
- **Examples:** created_at, updated_at, author_id, industry_id

### API Endpoints
- **Format:** kebab-case, plural  
- **Examples:** /api/blog-posts, /api/industries, /api/contacts

### TypeScript Types
- **Format:** PascalCase  
- **Examples:** BlogPost, User, Industry, ContactSubmission

## Business Rules

### Email Uniqueness
- User emails must be unique
- Newsletter subscription emails must be unique (active subscriptions)

### Slug Generation
- Slugs must be unique within their entity type
- Generated from name, lowercase with hyphens
- No special characters except hyphens

### Content Publication
- Only published blog posts appear publicly
- Draft posts are only visible to admins
- Archived posts are hidden from public lists

### Data Retention
- Contact submissions are never deleted (audit trail)
- Newsletter subscriptions use soft delete (isActive flag)
- Blog posts use soft delete (archived status)

## Validation Rules

### Email Format
- Must be valid email format
- Maximum 320 characters (RFC 5321)
- Lowercase storage

### Name Fields
- Minimum 2 characters
- Maximum 255 characters
- Trim whitespace

### Content Fields
- Rich text allowed (sanitized)
- No length limit for blog content
- HTML allowed in blog posts only

## Security Considerations

### Public IDs
- Use nanoid for public-facing IDs
- Never expose internal integer IDs in URLs
- 12-character length provides good collision resistance

### Data Access
- Admin users can access all data
- Public users can only access published content
- Contact submissions are admin-only

### PII Handling
- Email addresses are personally identifiable information
- Store contact submissions securely
- Implement data retention policies
