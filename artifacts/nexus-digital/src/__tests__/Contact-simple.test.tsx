import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Contact from '@/pages/Contact';

// Mock the useContactForm hook
vi.mock('@/hooks/use-contact-form', () => ({
  useContactForm: vi.fn(),
}));

// Mock the industries data
vi.mock('@/data/industries', () => ({
  industries: [
    { slug: 'technology', name: 'Technology' },
    { slug: 'finance', name: 'Finance' },
    { slug: 'healthcare', name: 'Healthcare' },
  ],
}));

// Mock PageTransition component
vi.mock('@/components/PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the contact form correctly', async () => {
    const { useContactForm } = await import('@/hooks/use-contact-form');
    const mockUseContactForm = vi.mocked(useContactForm);
    
    mockUseContactForm.mockReturnValue({
      form: {
        register: vi.fn(),
        handleSubmit: vi.fn(),
        getValues: vi.fn(() => ({})),
        reset: vi.fn(),
      },
      isLoading: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any);

    render(<Contact />, { wrapper: createWrapper() });

    // Check main heading
    expect(screen.getByText(/Let's build/)).toBeInTheDocument();
    expect(screen.getByText(/something unreasonable/)).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Details/)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /Start Your Project/ })).toBeInTheDocument();
  });

  it('should show loading state when submitting', async () => {
    const { useContactForm } = await import('@/hooks/use-contact-form');
    const mockUseContactForm = vi.mocked(useContactForm);
    
    mockUseContactForm.mockReturnValue({
      form: {
        register: vi.fn(),
        handleSubmit: vi.fn(),
        getValues: vi.fn(() => ({})),
        reset: vi.fn(),
      },
      isLoading: true,
      isSuccess: false,
      reset: vi.fn(),
    } as any);

    render(<Contact />, { wrapper: createWrapper() });

    expect(screen.getByText(/Sending.../)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show success state when form is submitted successfully', async () => {
    const { useContactForm } = await import('@/hooks/use-contact-form');
    const mockUseContactForm = vi.mocked(useContactForm);
    const mockReset = vi.fn();
    
    mockUseContactForm.mockReturnValue({
      form: {
        register: vi.fn(),
        handleSubmit: vi.fn(),
        getValues: vi.fn(() => ({})),
        reset: mockReset,
      },
      isLoading: false,
      isSuccess: true,
      reset: mockReset,
    } as any);

    render(<Contact />, { wrapper: createWrapper() });

    expect(screen.getByText(/Message Sent!/)).toBeInTheDocument();
    expect(screen.getByText(/Send another message/)).toBeInTheDocument();
  });

  it('should display contact information', async () => {
    const { useContactForm } = await import('@/hooks/use-contact-form');
    const mockUseContactForm = vi.mocked(useContactForm);
    
    mockUseContactForm.mockReturnValue({
      form: {
        register: vi.fn(),
        handleSubmit: vi.fn(),
        getValues: vi.fn(() => ({})),
        reset: vi.fn(),
      },
      isLoading: false,
      isSuccess: false,
      reset: vi.fn(),
    } as any);

    render(<Contact />, { wrapper: createWrapper() });

    expect(screen.getByText(/\+1 \(800\) 555-0199/)).toBeInTheDocument();
    expect(screen.getByText(/hello@nexusdigital.io/)).toBeInTheDocument();
    expect(screen.getByText(/Secure Line/)).toBeInTheDocument();
    expect(screen.getByText(/Direct Comm/)).toBeInTheDocument();
  });
});
