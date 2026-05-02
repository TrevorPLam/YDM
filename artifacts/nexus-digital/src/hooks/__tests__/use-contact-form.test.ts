import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContactForm } from "../use-contact-form";

// Mock the API client
jest.mock("@workspace/api-client-react", () => ({
  useSubmitContact: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  })),
}));

// Mock the toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
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

describe("useContactForm", () => {
  it("should initialize form with default values", () => {
    const { result } = renderHook(() => useContactForm(), {
      wrapper: createWrapper(),
    });

    expect(result.current.form.getValues()).toEqual({
      fullName: "",
      email: "",
      message: "",
      company: "",
      phone: "",
    });
  });

  it("should provide form submission handler", () => {
    const { result } = renderHook(() => useContactForm(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.handleSubmit).toBe("function");
  });

  it("should provide loading state", () => {
    const { result } = renderHook(() => useContactForm(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.isLoading).toBe("boolean");
    expect(result.current.isLoading).toBe(false);
  });

  it("should provide reset function", () => {
    const { result } = renderHook(() => useContactForm(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.reset).toBe("function");
  });
});
