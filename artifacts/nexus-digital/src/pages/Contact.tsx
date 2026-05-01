import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { industries } from "@/data/industries";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <PageTransition>
      <section className="min-h-screen pt-32 pb-20 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6 border-primary/30 w-fit">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium text-sm tracking-widest uppercase">Initialize Protocol</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Let's build<br />something<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/50">unreasonable.</span></h1>
              <p className="text-xl text-muted-foreground mb-8">
                Ready to make your competitors irrelevant? Drop us a line. We usually respond within 2 hours.
              </p>
              
              <div className="space-y-6 text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center border-white/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">Secure Line</p>
                    <p>+1 (800) 555-0199</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center border-white/10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">Direct Comm</p>
                    <p>hello@nexusdigital.io</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                
                <form className="relative z-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">Name</label>
                      <input 
                        type="text" 
                        placeholder="Jane Doe" 
                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground pl-1">Email</label>
                      <input 
                        type="email" 
                        placeholder="jane@example.com" 
                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">Industry</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Select your sector...</option>
                        {industries.map(ind => (
                          <option key={ind.slug} value={ind.slug}>{ind.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground pl-1">Project Details</label>
                    <textarea 
                      placeholder="Tell us about the challenge you're trying to solve..." 
                      rows={5}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(0,91,181,0.4)] hover:shadow-[0_0_30px_rgba(0,91,181,0.6)] transition-all group"
                  >
                    Start Your Project
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </Button>
                </form>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
