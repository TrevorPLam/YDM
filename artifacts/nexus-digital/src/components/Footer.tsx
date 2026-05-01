import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="w-8 h-8 bg-primary rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]" />
              <span className="text-xl font-heading font-bold tracking-wider text-foreground">
                NEXUS
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              We craft bleeding-edge digital experiences for ambitious brands. 
              Not just websites — next-generation platforms that dominate their respective industries.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(0,91,181,0.3)]">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(0,91,181,0.3)]">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:shadow-[0_0_15px_rgba(0,91,181,0.3)]">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-foreground font-heading font-semibold mb-6">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">Process</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Insights</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-foreground font-heading font-semibold mb-6">Industries</h4>
            <ul className="flex flex-col gap-3">
              <li><Link href="/industries/photographers" className="text-muted-foreground hover:text-primary transition-colors">Photographers</Link></li>
              <li><Link href="/industries/real-estate" className="text-muted-foreground hover:text-primary transition-colors">Real Estate</Link></li>
              <li><Link href="/industries/fitness-studios" className="text-muted-foreground hover:text-primary transition-colors">Fitness</Link></li>
              <li><Link href="/industries" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium mt-2">View All 12 Industries &rarr;</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexus Digital. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
