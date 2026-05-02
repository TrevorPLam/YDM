import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';

// Mock PageTransition component
vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Blog Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Blog Page', () => {
    it('should render blog list page correctly', () => {
      const mockPosts = [
        {
          id: 1,
          slug: 'test-post-1',
          title: 'Test Post 1',
          content: 'Test content 1',
          excerpt: 'Test excerpt 1',
          featured: false,
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      vi.mocked(await import('@/hooks/use-blog')).useBlogPosts.mockReturnValue({
        posts: mockPosts,
        isLoading: false,
        error: null,
        pagination: {
          page: 0,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });

      render(<Blog />, { wrapper: createWrapper() });

      expect(screen.getByText('Latest Posts')).toBeInTheDocument();
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      vi.mocked(await import('@/hooks/use-blog')).useBlogPosts.mockReturnValue({
        posts: [],
        isLoading: true,
        error: null,
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });

      render(<Blog />, { wrapper: createWrapper() });

      expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    });

    it('should show error state', () => {
      vi.mocked(await import('@/hooks/use-blog')).useBlogPosts.mockReturnValue({
        posts: [],
        isLoading: false,
        error: 'Failed to load posts',
        pagination: {
          page: 0,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });

      render(<Blog />, { wrapper: createWrapper() });

      expect(screen.getByText('Failed to load posts')).toBeInTheDocument();
    });
  });

  describe('BlogPost Page', () => {
    it('should render blog post correctly', () => {
      const mockPost = {
        id: 1,
        slug: 'test-post',
        title: 'Test Post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        featured: false,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      vi.mocked(await import('@/hooks/use-blog')).useBlogPost.mockReturnValue(mockPost);

      render(<BlogPost />, { wrapper: createWrapper() });

      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByText('Test excerpt')).toBeInTheDocument();
    });

    it('should show loading state for blog post', () => {
      vi.mocked(await import('@/hooks/use-blog')).useBlogPost.mockReturnValue({
        isLoading: true,
        error: null,
        post: null
      });

      render(<BlogPost />, { wrapper: createWrapper() });

      expect(screen.getByText('Loading post...')).toBeInTheDocument();
    });

    it('should show error state for blog post', () => {
      vi.mocked(await import('@/hooks/use-blog')).useBlogPost.mockReturnValue({
        isLoading: false,
        error: 'Post not found',
        post: null
      });

      render(<BlogPost />, { wrapper: createWrapper() });

      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });
  });

  describe('Blog Components Integration', () => {
    it('should navigate between blog pages', async () => {
      const user = userEvent.setup();
      
      // Mock navigation
      const mockNavigate = vi.fn();
      vi.mocked(await import('wouter')).useNavigate.mockReturnValue(mockNavigate);

      render(<Blog />, { wrapper: createWrapper() });

      // Click on a blog post
      const firstPost = screen.getByText('Test Post 1');
      await user.click(firstPost);

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/blog/test-post-1');
    });
  });
});
