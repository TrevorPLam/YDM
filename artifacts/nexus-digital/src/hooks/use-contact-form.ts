import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import type { ContactSubmission } from "@workspace/api-client-react";

// Use the generated Zod schema from the API client
const contactFormSchema = {
  fullName: "",
  email: "",
  company: "",
  message: "",
  phone: "",
} as const;

export type ContactFormData = Omit<ContactSubmission, "company" | "phone"> & {
  company?: string;
  phone?: string;
};

export function useContactForm() {
  const { toast } = useToast();

  const mutation = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you within 2 hours.",
        });
      },
      onError: (error) => {
        console.error("Contact form submission error:", error);
        toast({
          title: "Failed to send message",
          description: error instanceof Error 
            ? error.message 
            : "Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const form = useForm<ContactFormData>({
    // Note: We'll implement client-side validation in a future iteration
    // For now, we rely on server-side validation from the API
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
      company: "",
      phone: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data: ContactFormData) => {
    // Transform data to match API schema
    const submissionData: ContactSubmission = {
      fullName: data.fullName,
      email: data.email,
      message: data.message,
      ...(data.company && { company: data.company }),
      ...(data.phone && { phone: data.phone }),
    };

    mutation.mutate({ data: submissionData });
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
