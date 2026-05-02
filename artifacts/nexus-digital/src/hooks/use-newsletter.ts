import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { NewsletterSubscription } from "@workspace/api-client-react";
import { z } from "zod";

// Email validation schema
const newsletterSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

export function useNewsletter() {
  const { toast } = useToast();

  const mutation = useSubscribeNewsletter({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Successfully subscribed!",
          description: "Welcome to Nexus Digital insights. Check your email for confirmation.",
        });
      },
      onError: (error) => {
        console.error("Newsletter subscription error:", error);
        
        // Handle duplicate subscriptions gracefully
        if (error instanceof Error && error.message.includes("already exists")) {
          toast({
            title: "Already subscribed",
            description: "You're already on our list. Thanks for your interest!",
            variant: "default",
          });
        } else {
          toast({
            title: "Subscription failed",
            description: error instanceof Error 
              ? error.message 
              : "Please try again later.",
            variant: "destructive",
          });
        }
      },
    },
  });

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: NewsletterFormData) => {
    // Transform data to match API schema
    const subscriptionData: NewsletterSubscription = {
      email: data.email,
      source: "website", // Track subscription source
    };

    mutation.mutate({ data: subscriptionData });
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  return {
    form,
    handleSubmit,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: () => {
      form.reset();
      mutation.reset();
    },
  };
}
