import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, BarChart3, CheckCircle2, ChevronRight, Globe, Layers, Zap } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { IndustryMap } from "@/components/IndustryMap";
import { industries } from "@/data/industries";
import { Button } from "@/components/ui/button";

export default function Home() {
  const featuredIndustries = industries.slice(0, 3);

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <ParticleNetwork />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-block glass-card px-4 py-1.5 rounded-full mb-6 border-primary/30">
              <span className="text-primary font-medium text-sm tracking-widest uppercase">The Next Generation of Digital</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter mb-6 leading-[1.1]">
              Crafting Digital<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/50">
                Experiences
              </span><br />
              For Every Industry
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              We don't build templates. We architect bleeding-edge platforms 
              that make your competitors feel a decade behind.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(0,91,181,0.5)] hover:shadow-[0_0_50px_rgba(0,91,181,0.8)] transition-all duration-300" asChild>
                <Link href="/contact">Start Your Project <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg glass-card border-white/10 hover:bg-white/5" asChild>
                <Link href="/how-it-works">Our Process</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y border-white/5 bg-black/20 backdrop-blur-sm py-10 overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-8">Trusted by visionaries</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["AETHER", "LUMINA", "SYNAPSE", "VOID", "NOVA", "VERTEX"].map((partner) => (
              <div key={partner} className="flex items-center gap-2">
                <div className="w-6 h-6 border border-current rotate-45 flex items-center justify-center">
                  <div className="w-2 h-2 bg-current" />
                </div>
                <span className="font-heading font-bold tracking-widest">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Map Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">The Industry Constellation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every vertical requires a distinct digital architecture. Explore how we map solutions to specific market physics.
            </p>
          </div>
          
          <IndustryMap />
        </div>
      </section>

      {/* Bento Grid Featured */}
      <section className="py-32 bg-black/20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Featured Paradigms</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Deep dives into how we've reshaped specific digital landscapes.</p>
            </div>
            <Button variant="link" className="hidden md:flex text-primary hover:text-white" asChild>
              <Link href="/industries">View All Sectors <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredIndustries.map((ind, i) => (
              <motion.div 
                key={ind.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2 }}
                className={`group relative overflow-hidden rounded-2xl glass-card border border-white/5 glow-hover ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
                <img 
                  src={ind.imageUrl} 
                  alt={ind.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-60"
                />
                
                <div className="relative z-20 p-8 h-full flex flex-col justify-end min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center mb-4 border border-primary/50 text-primary">
                    {i === 0 ? <Globe /> : i === 1 ? <Zap /> : <Layers />}
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-2">{ind.name}</h3>
                  <p className="text-gray-300 mb-6">{ind.description}</p>
                  
                  <Link href={`/industries/${ind.slug}`} className="inline-flex items-center text-primary font-medium group-hover:text-white transition-colors">
                    Explore Architecture <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button variant="link" className="md:hidden text-primary mt-8 w-full justify-center" asChild>
            <Link href="/industries">View All Sectors <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-10 rounded-2xl border-t border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl md:text-6xl font-heading font-bold text-white mb-2 flex justify-center">
                <AnimatedCounter value={50} suffix="+" />
              </div>
              <div className="text-primary font-medium tracking-widest uppercase text-sm">Concept Sites Built</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 rounded-2xl border-t border-white/10 relative overflow-hidden group"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl md:text-6xl font-heading font-bold text-white mb-2 flex justify-center">
                <AnimatedCounter value={19} />
              </div>
              <div className="text-primary font-medium tracking-widest uppercase text-sm">Industries Mapped</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 rounded-2xl border-t border-white/10 relative overflow-hidden group"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl md:text-6xl font-heading font-bold text-white mb-2 flex justify-center">
                <AnimatedCounter value={4.9} />
              </div>
              <div className="text-primary font-medium tracking-widest uppercase text-sm">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">Ready to break the mold?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop competing on aesthetics. Start competing on architecture. Let's build your unfair advantage.
          </p>
          <Button size="lg" className="h-16 px-10 text-lg bg-primary text-white shadow-[0_0_40px_rgba(0,91,181,0.6)] hover:scale-105 transition-transform" asChild>
             <Link href="/contact">Initialize Protocol</Link>
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}
