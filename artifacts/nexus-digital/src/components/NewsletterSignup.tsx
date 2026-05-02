import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletter } from "@/hooks/use-newsletter";

interface NewsletterSignupProps {
  className?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  placeholder?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function NewsletterSignup({
  className = "",
  title = "Subscribe to Nexus",
  description = "Get cutting-edge digital strategies delivered to your inbox monthly.",
  buttonText = "Subscribe",
  placeholder = "Email address",
  showIcon = true,
  compact = false,
}: NewsletterSignupProps) {
  const { form, handleSubmit, isLoading, isSuccess, reset } = useNewsletter();

  // Don't show form if successfully subscribed
  if (isSuccess) {
    return (
      <div className={`text-center ${className}`}>
        {showIcon && (
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        )}
        <h3 className={`font-heading font-bold mb-2 ${compact ? "text-sm" : "text-lg"}`}>
          Successfully subscribed!
        </h3>
        <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          Welcome to Nexus Digital insights.
        </p>
        {!compact && (
          <button
            type="button"
            onClick={reset}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Subscribe another email
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showIcon && !compact && (
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      )}
      
      <div className="text-center mb-4">
        <h3 className={`font-heading font-bold mb-2 ${compact ? "text-sm" : "text-lg"}`}>
          {title}
        </h3>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            {...form.register("email")}
            type="email"
            placeholder={placeholder}
            disabled={isLoading}
            className={`${compact ? "h-9 text-sm" : "h-10"} bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all`}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400 mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full ${compact ? "h-9 text-sm" : "h-10"} bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(0,91,181,0.4)] hover:shadow-[0_0_30px_rgba(0,91,181,0.6)] transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Subscribing...
            </>
          ) : (
            <>
              {buttonText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
