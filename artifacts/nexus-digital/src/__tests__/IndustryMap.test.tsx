import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IndustryMap from '@/components/IndustryMap';

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

describe('IndustryMap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render industry map correctly', () => {
    const mockIndustries = [
      { slug: 'technology', name: 'Technology' },
      { slug: 'finance', name: 'Finance' },
      { slug: 'healthcare', name: 'Healthcare' }
    ];

    render(<IndustryMap industries={mockIndustries} />, { wrapper: createWrapper() });

    // Check that industries are displayed
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<IndustryMap industries={[]} isLoading={true} />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading industries...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(<IndustryMap industries={[]} error="Failed to load industries" />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load industries')).toBeInTheDocument();
  });
});
