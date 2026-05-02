# YDM API Documentation

## Overview

The YDM (Nexus Digital) API provides a RESTful interface for managing content, communications, and user interactions. This API follows OpenAPI 3.1.0 specifications and supports JSON-based request/response formats.

**Base URL:** `https://your-domain.com/api`  
**API Version:** v0.1.0  
**Content-Type:** `application/json`

## Quick Start

Get up and running in under 10 minutes with this complete walkthrough.

### 1. Get Your API Key

All write operations require authentication. Contact your administrator to get an API key.

### 2. Make Your First API Call

Test the health endpoint to verify connectivity:

```bash
curl -X GET "https://your-domain.com/api/healthz" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

### 3. Submit a Contact Form

```bash
curl -X POST "https://your-domain.com/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "message": "I need help with your services",
    "phone": "+1-555-0123"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "publicId": "abc123def456",
  "fullName": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "message": "I need help with your services",
  "phone": "+1-555-0123",
  "source": "api",
  "status": "received",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

## Authentication

### API Key Authentication

The YDM API uses API key authentication for write operations (POST, PUT, DELETE). Read operations (GET) are publicly accessible.

#### Getting an API Key

1. Contact your system administrator
2. Receive a secure API key string
3. Include it in the `X-API-Key` header for authenticated requests

#### Using the API Key

```bash
curl -X POST "https://your-domain.com/api/blog/posts" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my blog post...",
    "industryId": 1
  }'
```

#### Authentication Errors

**401 Unauthorized** - Missing or invalid API key
```json
{
  "error": "Unauthorized",
  "details": [
    {
      "field": "X-API-Key",
      "message": "Valid API key required for this operation"
    }
  ]
}
```

## API Endpoints

### Health Check

#### GET /healthz
Check API server health status.

**Authentication:** None required  
**Rate Limit:** None

**Response:**
```json
{
  "status": "healthy"
}
```

### Contact Management

#### POST /contacts
Submit a contact form message.

**Authentication:** None required  
**Rate Limit:** 5 requests per minute per IP

**Request Body:**
```json
{
  "fullName": "string (2-255 chars)",
  "email": "string (valid email, max 320 chars)",
  "company": "string (optional, max 255 chars)",
  "message": "string (10-5000 chars)",
  "phone": "string (optional, max 50 chars)"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "publicId": "abc123def456",
  "fullName": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "message": "I need help with your services",
  "phone": "+1-555-0123",
  "source": "api",
  "status": "received",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

### Newsletter Subscriptions

#### POST /newsletter
Subscribe an email address to the newsletter.

**Authentication:** None required  
**Rate Limit:** 3 requests per minute per email

**Request Body:**
```json
{
  "email": "string (valid email, max 320 chars)",
  "firstName": "string (optional, max 100 chars)",
  "lastName": "string (optional, max 100 chars)",
  "source": "string (optional, max 50 chars)"
}
```

**Response:** `201 Created` (new subscription) or `200 OK` (existing subscription)
```json
{
  "id": 1,
  "publicId": "xyz789abc123",
  "email": "newsletter@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "source": "footer",
  "isActive": true,
  "createdAt": "2026-01-15T11:00:00.000Z"
}
```

### Industry Data

#### GET /industries
List industries with pagination and search.

**Authentication:** None required  
**Rate Limit:** 100 requests per minute

**Query Parameters:**
- `page` (integer, default: 0) - Page number for pagination
- `limit` (integer, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search term for name/description
- `orderBy` (string, default: "name") - Sort order: "name" or "created_at"

**Response:** `200 OK`
```json
{
  "industries": [
    {
      "id": 1,
      "publicId": "ind123abc456",
      "name": "Technology",
      "slug": "technology",
      "description": "Software and technology solutions",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /industries/{slug}
Get a single industry by slug.

**Authentication:** None required  
**Rate Limit:** 100 requests per minute

**Path Parameters:**
- `slug` (string) - Industry slug

**Response:** `200 OK`
```json
{
  "id": 1,
  "publicId": "ind123abc456",
  "name": "Technology",
  "slug": "technology",
  "description": "Software and technology solutions",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

### Blog Management

#### GET /blog/posts
List blog posts with pagination, search, and filtering.

**Authentication:** None required  
**Rate Limit:** 100 requests per minute

**Query Parameters:**
- `page` (integer, default: 0) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `search` (string, optional) - Search term for title/content
- `industrySlug` (string, optional) - Filter by industry
- `featured` (boolean, optional) - Filter featured posts only
- `orderBy` (string, default: "published_at") - Sort order

**Response:** `200 OK`
```json
{
  "blogPosts": [
    {
      "id": 1,
      "publicId": "post123abc456",
      "title": "Getting Started with APIs",
      "slug": "getting-started-with-apis",
      "content": "Full blog post content here...",
      "metaDescription": "Learn how to integrate with modern APIs",
      "status": "published",
      "isFeatured": true,
      "publishedAt": "2026-01-15T09:00:00.000Z",
      "authorId": 1,
      "industryId": 1,
      "industry": {
        "id": 1,
        "name": "Technology",
        "slug": "technology"
      },
      "createdAt": "2026-01-15T08:30:00.000Z",
      "updatedAt": "2026-01-15T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /blog/posts/{slug}
Get a single blog post by slug.

**Authentication:** None required  
**Rate Limit:** 100 requests per minute

**Response:** `200 OK` (same structure as individual post in list)

#### POST /blog/posts
Create a new blog post.

**Authentication:** Required (API Key)  
**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "title": "string (5-255 chars)",
  "slug": "string (optional, 1-255 chars, lowercase with hyphens)",
  "content": "string (min 50 chars)",
  "metaDescription": "string (optional, max 160 chars)",
  "industryId": "integer",
  "isFeatured": "boolean (default: false)",
  "status": "string (draft|published, default: draft)"
}
```

**Response:** `201 Created`

#### PUT /blog/posts/{slug}
Update an existing blog post.

**Authentication:** Required (API Key)  
**Rate Limit:** 10 requests per minute

#### DELETE /blog/posts/{slug}
Soft delete a blog post (sets status to archived).

**Authentication:** Required (API Key)  
**Rate Limit:** 5 requests per minute

**Response:** `204 No Content`

## Error Handling

### Error Response Format

All error responses follow this consistent format:

```json
{
  "error": "Human-readable error message",
  "details": [
    {
      "field": "field_name",
      "message": "Specific error for this field"
    }
  ]
}
```

### Common Error Codes

#### 400 Bad Request
Invalid request parameters or malformed data.

**Example:**
```json
{
  "error": "Invalid input",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "message",
      "message": "Message must be at least 10 characters"
    }
  ]
}
```

#### 401 Unauthorized
Missing or invalid authentication.

**Example:**
```json
{
  "error": "Unauthorized",
  "details": [
    {
      "field": "X-API-Key",
      "message": "Valid API key required for this operation"
    }
  ]
}
```

#### 404 Not Found
Resource not found.

**Example:**
```json
{
  "error": "Industry not found",
  "details": []
}
```

#### 429 Too Many Requests
Rate limit exceeded.

**Example:**
```json
{
  "error": "Rate limit exceeded",
  "details": [
    {
      "field": "X-RateLimit-Limit",
      "message": "5 requests per minute allowed"
    }
  ]
}
```

#### 500 Internal Server Error
Server-side error occurred.

**Example:**
```json
{
  "error": "Internal server error",
  "details": []
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

| Endpoint Type | Limit | Time Window |
|---------------|-------|-------------|
| Health Check | None | - |
| Contact Form | 5 requests | per minute per IP |
| Newsletter | 3 requests | per minute per email |
| Industry Read | 100 requests | per minute |
| Blog Read | 100 requests | per minute |
| Blog Write | 10 requests | per minute |

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Request limit for the endpoint
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets

## Code Samples

### JavaScript (Node.js)

```javascript
// Submit contact form
const response = await fetch('https://your-domain.com/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    message: 'I need help with your services'
  })
});

const data = await response.json();
console.log(data);
```

### Python

```python
import requests

# Submit contact form
response = requests.post('https://your-domain.com/api/contacts', json={
    'fullName': 'John Doe',
    'email': 'john@example.com',
    'message': 'I need help with your services'
})

data = response.json()
print(data)
```

### cURL

```bash
# Submit contact form
curl -X POST "https://your-domain.com/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "message": "I need help with your services"
  }'
```

## SDKs and Libraries

Currently, the YDM API does not provide official SDKs. However, you can easily integrate using any HTTP client library with the examples above.

## Versioning

The API uses URL path versioning. The current version is v0.1.0.

**Version Format:** `https://your-domain.com/api/v{major}/resources`

**Backward Compatibility:** 
- Minor version updates are backward compatible
- Major version updates may contain breaking changes
- Deprecated endpoints are announced 30 days before removal

## Changelog

### v0.1.0 (2026-01-15)
- Initial API release
- Contact form submission endpoint
- Newsletter subscription endpoint
- Industry data endpoints
- Blog management endpoints
- API key authentication

## Support

For API support and questions:
- Email: api-support@your-domain.com
- Documentation: https://docs.your-domain.com
- Status Page: https://status.your-domain.com

## Terms of Use

By using this API, you agree to the following terms:
- Use the API for lawful purposes only
- Respect rate limits and fair usage policies
- Do not share your API key with unauthorized parties
- Comply with all applicable data protection laws

Full terms and conditions available at: https://your-domain.com/terms
