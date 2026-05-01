import { motion, useScroll, useSpring } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Search, Compass, PenTool, Rocket, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    id: "01",
    title: "Discovery & Research",
    icon: Search,
    description: "We don't guess. We analyze market physics. We study your competitors, identify their blind spots, and map out the exact digital real estate you need to claim.",
    deliverables: ["Market Gap Analysis", "Competitor Audit", "UX Blueprint"]
  },
  {
    id: "02",
    title: "Strategy & Architecture",
    icon: Compass,
    description: "Before a single pixel is pushed, we architect the flow. This is where we define how a visitor transforms into a lead, mapping every interaction point.",
    deliverables: ["Conversion Funnel", "Information Architecture", "Tech Stack Definition"]
  },
  {
    id: "03",
    title: "Design & Build",
    icon: PenTool,
    description: "Where aesthetics meet engineering. We craft immersive, high-fidelity interfaces backed by lightning-fast headless architectures.",
    deliverables: ["High-Fidelity Mockups", "Interactive Prototypes", "Production Code"]
  },
  {
    id: "04",
    title: "Launch & Optimize",
    icon: Rocket,
    description: "Deployment is just the beginning. We monitor interactions, analyze heatmaps, and continuously refine the platform to maximize conversion velocity.",
    deliverables: ["Zero-Downtime Deployment", "A/B Testing Setup", "Performance Analytics"]
  }
];

export default function Process() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6 border-primary/30">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-medium text-sm tracking-widest uppercase">The Protocol</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">How We Build.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our proprietary methodology for engineering digital dominance. 
              Precision at every phase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative" ref={containerRef}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Progress Line */}
            <div className="absolute left-[28px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/10" />
            <motion.div 
              className="absolute left-[28px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-primary origin-top shadow-[0_0_15px_rgba(0,91,181,0.8)]"
              style={{ scaleY }}
            />

            <div className="space-y-24">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={step.id} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Node */}
                    <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full glass-card border border-primary/50 text-primary z-10 bg-background">
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`w-full pl-20 md:pl-0 md:w-[calc(50%-40px)] ${isEven ? 'md:pl-10' : 'md:pr-10'}`}
                    >
                      <div className="glass-card p-8 rounded-2xl glow-hover relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 text-9xl font-heading font-bold text-white/5 pointer-events-none transition-transform group-hover:scale-110">
                          {step.id}
                        </div>
                        
                        <h3 className="text-2xl font-heading font-bold mb-4 text-foreground relative z-10">{step.title}</h3>
                        <p className="text-muted-foreground mb-6 relative z-10 leading-relaxed">
                          {step.description}
                        </p>
                        
                        <div className="relative z-10">
                          <h4 className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">Key Deliverables</h4>
                          <ul className="space-y-2">
                            {step.deliverables.map(del => (
                              <li key={del} className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-primary/70" />
                                {del}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
