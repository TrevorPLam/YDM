import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/industries", label: "Industries" },
  { href: "/how-it-works", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Insights" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 border-t-0 border-x-0">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]" />
          <span className="text-xl font-heading font-bold tracking-wider text-foreground">
            NEXUS
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors hover:text-primary ${
                  location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-[0_0_20px_rgba(0,91,181,0.4)] hover:shadow-[0_0_30px_rgba(0,91,181,0.6)] transition-shadow">
            <Link href="/contact">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg p-2 rounded-md ${
                    location.startsWith(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="w-full mt-2 bg-primary">
                <Link href="/contact" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
