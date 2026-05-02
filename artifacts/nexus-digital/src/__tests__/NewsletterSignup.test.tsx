import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import NewsletterSignup from '@/components/NewsletterSignup';

// Mock the useNewsletter hook
vi.mock('@/hooks/use-newsletter', () => ({
  useNewsletter: vi.fn(),
}));

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

describe('NewsletterSignup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render newsletter signup form correctly', () => {
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: vi.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    // Check main heading
    expect(screen.getByText(/Stay informed/)).toBeInTheDocument();
    expect(screen.getByText(/Subscribe to our newsletter/)).toBeInTheDocument();

    // Check email input
    expect(screen.getByLabelText(/Email address/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByRole('button', { name: /Subscribe/ })).toBeInTheDocument();
  });

  it('should show loading state when subscribing', async () => {
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: vi.fn(),
      isLoading: true,
      isSuccess: false,
      error: null,
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    expect(screen.getByText(/Subscribing.../)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show success state when subscription succeeds', async () => {
    const user = userEvent.setup();
    const mockSubscribe = vi.fn();
    
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: mockSubscribe,
      isLoading: false,
      isSuccess: true,
      error: null,
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/Email address/);
    const submitButton = screen.getByRole('button', { name: /Subscribe/ });

    // Fill form and submit
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Check success state
    await waitFor(() => {
      expect(screen.getByText(/Thank you for subscribing!/)).toBeInTheDocument();
      expect(screen.getByText(/You'll receive our latest updates/)).toBeInTheDocument();
    });

    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com');
  });

  it('should show error state when subscription fails', async () => {
    const user = userEvent.setup();
    const mockSubscribe = vi.fn();
    
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: mockSubscribe,
      isLoading: false,
      isSuccess: false,
      error: 'Email already subscribed',
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/Email address/);
    const submitButton = screen.getByRole('button', { name: /Subscribe/ });

    // Fill form and submit
    await user.type(emailInput, 'existing@example.com');
    await user.click(submitButton);

    // Check error state
    await waitFor(() => {
      expect(screen.getByText(/This email is already subscribed/)).toBeInTheDocument();
    });

    expect(mockSubscribe).toHaveBeenCalledWith('existing@example.com');
  });

  it('should disable submit button while loading', async () => {
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: vi.fn(),
      isLoading: true,
      isSuccess: false,
      error: null,
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    const submitButton = screen.getByRole('button', { name: /Subscribe/ });
    expect(submitButton).toBeDisabled();
  });

  it('should call subscribe when form is submitted', async () => {
    const user = userEvent.setup();
    const mockSubscribe = vi.fn();
    
    const mockUseNewsletter = vi.mocked(await import('@/hooks/use-newsletter')).useNewsletter;
    mockUseNewsletter.mockReturnValue({
      subscribe: mockSubscribe,
      isLoading: false,
      isSuccess: false,
      error: null,
    });

    render(<NewsletterSignup />, { wrapper: createWrapper() });

    const emailInput = screen.getByLabelText(/Email address/);
    const submitButton = screen.getByRole('button', { name: /Subscribe/ });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(mockSubscribe).toHaveBeenCalledWith('test@example.com');
  });
});
