import { describe, it, expect, beforeAll } from '@jest/globals';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

describe('Documentation Tests', () => {
  const openApiPath = path.resolve(__dirname, '../../../../lib/api-spec/openapi.yaml');
  let openApiSpec: any;

  beforeAll(() => {
    const fileContents = fs.readFileSync(openApiPath, 'utf8');
    openApiSpec = yaml.load(fileContents);
  });

  describe('OpenAPI Specification Validation', () => {
    it('should have valid OpenAPI structure', () => {
      expect(openApiSpec.openapi).toBe('3.1.0');
      expect(openApiSpec.info).toBeDefined();
      expect(openApiSpec.paths).toBeDefined();
      expect(openApiSpec.components).toBeDefined();
    });

    it('should have all required API info fields', () => {
      const info = openApiSpec.info;
      expect(info.title).toBe('Api'); // Title constraint for import paths
      expect(info.version).toBe('0.1.0');
      expect(info.description).toBeDefined();
    });

    it('should have proper tags defined', () => {
      const tags = openApiSpec.tags;
      const expectedTags = ['health', 'contacts', 'newsletter', 'industries', 'blog'];
      
      expectedTags.forEach(tag => {
        expect(tags.some((t: any) => t.name === tag)).toBe(true);
      });
    });
  });

  describe('Endpoint Documentation Completeness', () => {
    it('should document all endpoints with operationIds', () => {
      const paths = openApiSpec.paths;
      
      Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object' && operation.operationId) {
            expect(operation.operationId).toBeDefined();
            expect(operation.summary).toBeDefined();
            expect(operation.description).toBeDefined();
            expect(operation.responses).toBeDefined();
          }
        });
      });
    });

    it('should have response examples for all endpoints', () => {
      const paths = openApiSpec.paths;
      let missingExamples = 0;

      Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object' && operation.responses) {
            Object.entries(operation.responses).forEach(([statusCode, response]: [string, any]) => {
              if (statusCode.startsWith('2') && statusCode !== '204') {
                const hasExample = response.content?.['application/json']?.example || 
                                 response.content?.['application/json']?.schema;
                if (!hasExample) {
                  missingExamples++;
                }
              }
            });
          }
        });
      });

      expect(missingExamples).toBe(0);
    });

    it('should document error responses for all endpoints', () => {
      const paths = openApiSpec.paths;
      let endpointsWithErrorDocs = 0;

      Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object' && operation.responses) {
            const hasError = Object.keys(operation.responses).some(status => 
              status.startsWith('4') || status.startsWith('5')
            );
            if (hasError) {
              endpointsWithErrorDocs++;
            }
          }
        });
      });

      // All endpoints should have error documentation
      const totalEndpoints = Object.values(openApiSpec.paths)
        .flatMap((pathItem: any) => Object.keys(pathItem))
        .filter(key => ['get', 'post', 'put', 'delete', 'patch'].includes(key))
        .length;

      expect(endpointsWithErrorDocs).toBe(totalEndpoints);
    });
  });

  describe('Schema Documentation', () => {
    it('should have Error schema defined', () => {
      const schemas = openApiSpec.components.schemas;
      expect(schemas.Error).toBeDefined();
      
      const errorSchema = schemas.Error;
      expect(errorSchema.properties?.error).toBeDefined();
      expect(errorSchema.properties?.details).toBeDefined();
      expect(errorSchema.required).toContain('error');
    });

    it('should have proper schema descriptions', () => {
      const schemas = openApiSpec.components.schemas;
      let schemasWithoutDescriptions = 0;

      Object.entries(schemas).forEach(([schemaName, schema]: [string, any]) => {
        if (!schema.description) {
          schemasWithoutDescriptions++;
        }
      });

      expect(schemasWithoutDescriptions).toBe(0);
    });

    it('should have required fields properly defined', () => {
      const schemas = openApiSpec.components.schemas;
      
      // Check key schemas have required fields
      expect(schemas.ContactSubmission.required).toContain('fullName');
      expect(schemas.ContactSubmission.required).toContain('email');
      expect(schemas.ContactSubmission.required).toContain('message');
      
      expect(schemas.NewsletterSubscription.required).toContain('email');
      
      expect(schemas.CreateBlogPostRequest.required).toContain('title');
      expect(schemas.CreateBlogPostRequest.required).toContain('content');
      expect(schemas.CreateBlogPostRequest.required).toContain('industryId');
    });
  });

  describe('Authentication Documentation', () => {
    it('should have security schemes defined', () => {
      const securitySchemes = openApiSpec.components.securitySchemes;
      expect(securitySchemes).toBeDefined();
      expect(securitySchemes.ApiKeyAuth).toBeDefined();
    });

    it('should document ApiKeyAuth properly', () => {
      const apiKeyAuth = openApiSpec.components.securitySchemes.ApiKeyAuth;
      expect(apiKeyAuth.type).toBe('apiKey');
      expect(apiKeyAuth.in).toBe('header');
      expect(apiKeyAuth.name).toBe('X-API-Key');
      expect(apiKeyAuth.description).toBeDefined();
    });

    it('should apply security to appropriate endpoints', () => {
      const paths = openApiSpec.paths;
      
      // Blog write operations should require authentication
      const blogPostCreate = paths['/blog/posts']?.post;
      expect(blogPostCreate?.security).toEqual([{ ApiKeyAuth: [] }]);
      
      const blogPostUpdate = paths['/blog/posts/{slug}']?.put;
      expect(blogPostUpdate?.security).toEqual([{ ApiKeyAuth: [] }]);
      
      const blogPostDelete = paths['/blog/posts/{slug}']?.delete;
      expect(blogPostDelete?.security).toEqual([{ ApiKeyAuth: [] }]);
      
      // Read operations should not require authentication
      const healthCheck = paths['/healthz']?.get;
      expect(healthCheck?.security).toBeUndefined();
      
      const contactSubmit = paths['/contacts']?.post;
      expect(contactSubmit?.security).toBeUndefined();
    });
  });

  describe('Domain Glossary Consistency', () => {
    it('should use consistent terminology with domain glossary', () => {
      const paths = openApiSpec.paths;
      const schemas = openApiSpec.components.schemas;
      
      // Check that entity names match domain glossary
      expect(schemas.ContactSubmission).toBeDefined();
      expect(schemas.NewsletterSubscription).toBeDefined();
      expect(schemas.BlogPostResponse).toBeDefined();
      expect(schemas.IndustryResponse).toBeDefined();
      
      // Check field naming consistency
      const contactSchema = schemas.ContactSubmission;
      expect(contactSchema.properties?.fullName).toBeDefined();
      expect(contactSchema.properties?.company).toBeDefined();
      
      const blogSchema = schemas.BlogPostResponse;
      expect(blogSchema.properties?.publishedAt).toBeDefined();
      expect(blogSchema.properties?.authorId).toBeDefined();
      expect(blogSchema.properties?.industryId).toBeDefined();
    });

    it('should have proper field descriptions matching domain concepts', () => {
      const schemas = openApiSpec.components.schemas;
      
      // Check key fields have proper descriptions
      const contactFields = schemas.ContactSubmission.properties;
      expect(contactFields.email.description).toContain('Email address');
      expect(contactFields.message.description).toContain('Contact message');
      
      const blogFields = schemas.BlogPostResponse.properties;
      expect(blogFields.status.description).toContain('Publication status');
      expect(blogFields.isFeatured.description).toContain('featured');
    });
  });

  describe('Pagination and Search Patterns', () => {
    it('should document pagination parameters consistently', () => {
      const industryList = openApiSpec.paths['/industries']?.get;
      const blogList = openApiSpec.paths['/blog/posts']?.get;
      
      const expectedPaginationParams = ['page', 'limit'];
      
      expectedPaginationParams.forEach(param => {
        expect(industryList?.parameters?.some((p: any) => p.name === param)).toBe(true);
        expect(blogList?.parameters?.some((p: any) => p.name === param)).toBe(true);
      });
    });

    it('should document search functionality', () => {
      const industryList = openApiSpec.paths['/industries']?.get;
      const blogList = openApiSpec.paths['/blog/posts']?.get;
      
      expect(industryList?.parameters?.some((p: any) => p.name === 'search')).toBe(true);
      expect(blogList?.parameters?.some((p: any) => p.name === 'search')).toBe(true);
    });

    it('should have pagination response structure', () => {
      const schemas = openApiSpec.components.schemas;
      
      expect(schemas.IndustryListResponse.properties?.pagination).toBeDefined();
      expect(schemas.BlogPostListResponse.properties?.pagination).toBeDefined();
      
      const paginationFields = ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'];
      paginationFields.forEach(field => {
        expect(schemas.IndustryListResponse.properties.pagination.properties?.[field]).toBeDefined();
        expect(schemas.BlogPostListResponse.properties.pagination.properties?.[field]).toBeDefined();
      });
    });
  });

  describe('Rate Limiting Documentation', () => {
    it('should include rate limiting information in descriptions', () => {
      const contactSubmit = openApiSpec.paths['/contacts']?.post;
      const newsletterSubscribe = openApiSpec.paths['/newsletter']?.post;
      
      // Check that rate limiting is mentioned in descriptions
      const contactDesc = contactSubmit?.description?.toLowerCase() || '';
      const newsletterDesc = newsletterSubscribe?.description?.toLowerCase() || '';
      
      // At least one of them should mention rate limiting or similar concepts
      const hasRateLimitInfo = contactDesc.includes('rate') || 
                              newsletterDesc.includes('rate') ||
                              contactDesc.includes('limit') ||
                              newsletterDesc.includes('limit');
      
      expect(hasRateLimitInfo).toBe(true);
    });
  });

  describe('Response Status Code Consistency', () => {
    it('should use appropriate HTTP status codes', () => {
      const paths = openApiSpec.paths;
      
      // Creation operations should return 201
      expect(paths['/contacts']?.post?.responses?.['201']).toBeDefined();
      expect(paths['/newsletter']?.post?.responses?.['201']).toBeDefined();
      expect(paths['/blog/posts']?.post?.responses?.['201']).toBeDefined();
      
      // Successful reads should return 200
      expect(paths['/healthz']?.get?.responses?.['200']).toBeDefined();
      expect(paths['/industries']?.get?.responses?.['200']).toBeDefined();
      expect(paths['/industries/{slug}']?.get?.responses?.['200']).toBeDefined();
      
      // Not found should return 404
      expect(paths['/industries/{slug}']?.get?.responses?.['404']).toBeDefined();
      expect(paths['/blog/posts/{slug}']?.get?.responses?.['404']).toBeDefined();
      
      // Validation errors should return 400
      expect(paths['/contacts']?.post?.responses?.['400']).toBeDefined();
      expect(paths['/newsletter']?.post?.responses?.['400']).toBeDefined();
      
      // Unauthorized should return 401
      expect(paths['/blog/posts']?.post?.responses?.['401']).toBeDefined();
      expect(paths['/blog/posts/{slug}']?.put?.responses?.['401']).toBeDefined();
      expect(paths['/blog/posts/{slug}']?.delete?.responses?.['401']).toBeDefined();
      
      // Soft delete should return 204
      expect(paths['/blog/posts/{slug}']?.delete?.responses?.['204']).toBeDefined();
    });
  });

  describe('Content Type Consistency', () => {
    it('should specify JSON content type for all endpoints', () => {
      const paths = openApiSpec.paths;
      
      Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object' && operation.responses) {
            Object.entries(operation.responses).forEach(([statusCode, response]: [string, any]) => {
              if (statusCode !== '204' && response.content) {
                expect(response.content['application/json']).toBeDefined();
              }
            });
          }
        });
      });
    });

    it('should specify JSON content type for request bodies', () => {
      const paths = openApiSpec.paths;
      
      Object.entries(paths).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          if (typeof operation === 'object' && operation.requestBody) {
            expect(operation.requestBody.content['application/json']).toBeDefined();
          }
        });
      });
    });
  });
});
