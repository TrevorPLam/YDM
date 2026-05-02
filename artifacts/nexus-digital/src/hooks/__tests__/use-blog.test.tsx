import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBlogPost, useBlogPosts } from '../use-blog';

// Mock the API client
vi.mock('@workspace/api-client-react', () => ({
  useGetBlogPostBySlug: vi.fn(),
  useListBlogPosts: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBlog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBlogPost', () => {
    it('should return blog post with fallback data', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Blog Post',
        slug: 'test-post',
        content: 'Test content with enough words to generate read time',
        metaDescription: 'Test description',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        industryId: 1,
        isFeatured: false,
        industry: { id: 1, name: 'Technology', slug: 'technology' },
      };

      const { useGetBlogPostBySlug } = vi.mocked(await import('@workspace/api-client-react'));
      useGetBlogPostBySlug.mockReturnValue({
        data: mockPost,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useBlogPost('test-post'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          ...mockPost,
          readTime: expect.stringMatching(/\d+ min read/),
          imageUrl: expect.stringMatching(/https:\/\/images\.unsplash\.com/),
          category: 'Technology',
        });
      });
    });

    it('should handle missing industry data', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Blog Post',
        slug: 'test-post',
        content: 'Test content',
        metaDescription: 'Test description',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        industryId: 1,
        isFeatured: false,
        industry: null,
      };

      const { useGetBlogPostBySlug } = vi.mocked(await import('@workspace/api-client-react'));
      useGetBlogPostBySlug.mockReturnValue({
        data: mockPost,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useBlogPost('test-post'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.category).toBe('General');
      });
    });
  });

  describe('useBlogPosts', () => {
    it('should return paginated blog posts with fallback data', async () => {
      const mockResponse = {
        blogPosts: [
          {
            id: 1,
            title: 'Test Blog Post 1',
            slug: 'test-post-1',
            content: 'Test content 1',
            metaDescription: 'Test description 1',
            publishedAt: '2024-01-01T00:00:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            industryId: 1,
            isFeatured: false,
            industry: { id: 1, name: 'Technology', slug: 'technology' },
          },
        ],
        pagination: {
          page: 0,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      const { useListBlogPosts } = vi.mocked(await import('@workspace/api-client-react'));
      useListBlogPosts.mockReturnValue({
        data: mockResponse,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useBlogPosts({ page: 0, limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.blogPosts).toHaveLength(1);
        expect(result.current.blogPosts[0]).toEqual({
          ...mockResponse.blogPosts[0],
          readTime: expect.stringMatching(/\d+ min read/),
          imageUrl: expect.stringMatching(/https:\/\/images\.unsplash\.com/),
          category: 'Technology',
        });
        expect(result.current.pagination).toEqual(mockResponse.pagination);
      });
    });

    it('should handle search parameters', async () => {
      const { useListBlogPosts } = vi.mocked(await import('@workspace/api-client-react'));
      useListBlogPosts.mockReturnValue({
        data: { blogPosts: [], pagination: { page: 0, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
        error: null,
      });

      renderHook(() => useBlogPosts({ 
        page: 0, 
        limit: 10, 
        search: 'test search',
        industrySlug: 'technology',
        featured: true
      }), {
        wrapper: createWrapper(),
      });

      expect(useListBlogPosts).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
        search: 'test search',
        industrySlug: 'technology',
        featured: true,
        orderBy: 'published_at',
      });
    });

    it('should use default parameters', async () => {
      const { useListBlogPosts } = vi.mocked(await import('@workspace/api-client-react'));
      useListBlogPosts.mockReturnValue({
        data: { blogPosts: [], pagination: { page: 0, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
        error: null,
      });

      renderHook(() => useBlogPosts(), {
        wrapper: createWrapper(),
      });

      expect(useListBlogPosts).toHaveBeenCalledWith({
        page: 0,
        limit: 10,
        search: undefined,
        industrySlug: undefined,
        featured: undefined,
        orderBy: 'published_at',
      });
    });
  });
});
