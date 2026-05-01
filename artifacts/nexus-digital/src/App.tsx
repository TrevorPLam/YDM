import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Lazy load pages for now to just set up routing structure
import Home from "@/pages/Home";
import Industry from "@/pages/Industry";
import Process from "@/pages/Process";
import About from "@/pages/About";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/industries/:slug" component={Industry} />
        <Route path="/how-it-works" component={Process} />
        <Route path="/about" component={About} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="relative min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/30">
            <Navbar />
            <main className="flex-grow flex flex-col">
              <Router />
            </main>
            <Footer />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
