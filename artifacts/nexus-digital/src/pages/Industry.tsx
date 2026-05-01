import { useRoute } from "wouter";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { industries } from "@/data/industries";
import { ArrowRight, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import NotFound from "./not-found";
import { Button } from "@/components/ui/button";

export default function Industry() {
  const [match, params] = useRoute("/industries/:slug");
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  if (!match || !params?.slug) return <NotFound />;
  
  const industry = industries.find(i => i.slug === params.slug);
  
  if (!industry) return <NotFound />;

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 md:bg-background/60 backdrop-blur-[2px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-10" />
          <img 
            src={industry.imageUrl} 
            alt={industry.name} 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/industries" className="text-primary hover:text-white transition-colors mb-6 inline-flex items-center text-sm font-medium">
              &larr; Back to all industries
            </Link>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">{industry.name}</h1>
            <p className="text-2xl text-primary font-medium mb-6">{industry.tagline}</p>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {industry.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-3xl font-heading font-bold mb-10">The Vision</h2>
            
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-8 border-l border-white/10"
              >
                <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-destructive shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                <h3 className="text-xl font-bold mb-2">The Challenge</h3>
                <p className="text-muted-foreground">{industry.challenge}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative pl-8 border-l border-white/10"
              >
                <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-primary shadow-[0_0_10px_rgba(0,91,181,0.5)]" />
                <h3 className="text-xl font-bold mb-2">Our Strategy</h3>
                <p className="text-muted-foreground">{industry.strategy}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative pl-8 border-l border-white/10"
              >
                <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <h3 className="text-xl font-bold mb-2">Projected Outcome</h3>
                <p className="text-foreground font-medium">{industry.outcome}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Device Mockup */}
      <section className="py-20 bg-black/20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Platform Architecture</h2>
            
            <div className="inline-flex glass-card p-1 rounded-lg">
              <button 
                onClick={() => setDeviceView("desktop")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${deviceView === "desktop" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
              >
                <Monitor className="w-4 h-4" /> Desktop
              </button>
              <button 
                onClick={() => setDeviceView("tablet")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${deviceView === "tablet" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
              >
                <Tablet className="w-4 h-4" /> Tablet
              </button>
              <button 
                onClick={() => setDeviceView("mobile")}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${deviceView === "mobile" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
              >
                <Smartphone className="w-4 h-4" /> Mobile
              </button>
            </div>
          </div>
          
          <div className="flex justify-center items-center min-h-[600px]">
            <motion.div 
              layout
              className={`relative bg-background border border-white/10 overflow-hidden transition-all duration-500 ${
                deviceView === "desktop" ? "w-full max-w-5xl aspect-video rounded-t-xl rounded-b-md" : 
                deviceView === "tablet" ? "w-[768px] h-[1024px] rounded-[2rem] border-4 border-gray-800" : 
                "w-[375px] h-[812px] rounded-[3rem] border-[8px] border-gray-800"
              }`}
            >
              {/* Fake Browser/Device Header */}
              {deviceView === "desktop" && (
                <div className="h-8 bg-card border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
              )}
              {deviceView === "mobile" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-xl z-20" />
              )}
              
              {/* Placeholder Content */}
              <div className="w-full h-full relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-50" />
                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className="w-full h-16 bg-white/5 rounded-lg mb-8" />
                  <div className="w-3/4 h-32 bg-white/5 rounded-xl mb-4" />
                  <div className="w-1/2 h-8 bg-white/5 rounded mb-12" />
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="bg-white/5 rounded-xl" />
                    <div className="bg-white/5 rounded-xl" />
                  </div>
                </div>
                
                {/* Floating overlay to indicate it's a preview */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
                  <div className="glass-card px-6 py-3 rounded-full text-primary font-heading tracking-widest uppercase text-sm border-primary/30">
                    Interactive Preview Simulation
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Bento Grid */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{industry.name} Resources</h2>
            <p className="text-muted-foreground text-lg">Accelerate your growth with our proprietary playbooks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl glow-hover flex flex-col items-start"
            >
              <div className="text-primary mb-6 p-4 rounded-xl bg-primary/10">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Industry SEO Guide</h3>
              <p className="text-muted-foreground mb-6 flex-grow">
                The exact keyword architectures and content silos we use to rank our {industry.name.toLowerCase()} clients #1 locally.
              </p>
              <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary hover:text-white">Download PDF</Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-2xl glow-hover flex flex-col items-start bg-primary/5 border-primary/20"
            >
              <div className="text-primary mb-6 p-4 rounded-xl bg-primary/10">
                <ArrowRight className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Conversion Checklist</h3>
              <p className="text-muted-foreground mb-6 flex-grow">
                15 required elements every {industry.name.toLowerCase()} website must have to maximize conversion rates.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">Get Checklist</Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl glow-hover flex flex-col items-start"
            >
              <div className="text-primary mb-6 p-4 rounded-xl bg-primary/10">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Template</h3>
              <p className="text-muted-foreground mb-6 flex-grow">
                A basic starter template featuring our high-converting layout structure for {industry.name.toLowerCase()}.
              </p>
              <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary hover:text-white">View Template</Button>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
