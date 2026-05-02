import { industryService } from '../services/industries';

/**
 * Industry service integration tests
 * Tests the service layer directly without HTTP layer
 */
describe('Industry Service Integration', () => {
  beforeEach(() => {
    // Clear any mock data if needed
    jest.clearAllMocks();
  });

  describe('validateListIndustriesParams', () => {
    it('should validate valid parameters', () => {
      expect(() => {
        industryService.validateListIndustriesParams({
          page: 0,
          limit: 10,
          search: 'technology',
          orderBy: 'name'
        });
      }).not.toThrow();
    });

    it('should reject invalid page', () => {
      expect(() => {
        industryService.validateListIndustriesParams({ page: -1 });
      }).toThrow('Page must be a non-negative integer');

      expect(() => {
        industryService.validateListIndustriesParams({ page: 1.5 });
      }).toThrow('Page must be a non-negative integer');
    });

    it('should reject invalid limit', () => {
      expect(() => {
        industryService.validateListIndustriesParams({ limit: 0 });
      }).toThrow('Limit must be an integer between 1 and 100');

      expect(() => {
        industryService.validateListIndustriesParams({ limit: 101 });
      }).toThrow('Limit must be an integer between 1 and 100');
    });

    it('should reject invalid search', () => {
      expect(() => {
        industryService.validateListIndustriesParams({ search: '' });
      }).toThrow('Search cannot be empty');

      expect(() => {
        industryService.validateListIndustriesParams({ search: 'a'.repeat(101) });
      }).toThrow('Search term too long');
    });

    it('should reject invalid orderBy', () => {
      expect(() => {
        industryService.validateListIndustriesParams({ orderBy: 'invalid' as any });
      }).toThrow('OrderBy must be one of: name, created_at');
    });
  });

  describe('getIndustryBySlug validation', () => {
    it('should reject invalid slug types', async () => {
      await expect(industryService.getIndustryBySlug(null as any))
        .rejects.toThrow('Invalid slug provided');

      await expect(industryService.getIndustryBySlug(undefined as any))
        .rejects.toThrow('Invalid slug provided');

      await expect(industryService.getIndustryBySlug(123 as any))
        .rejects.toThrow('Invalid slug provided');
    });

    it('should reject slug that is too long', async () => {
      const longSlug = 'a'.repeat(101);
      await expect(industryService.getIndustryBySlug(longSlug))
        .rejects.toThrow('Slug too long');
    });
  });
});
