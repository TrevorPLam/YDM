import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "wouter";

const team = [
  {
    name: "Elena Rostova",
    role: "Creative Director",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "Obsessed with grid systems and kinetic typography. Believes every pixel should justify its existence."
  },
  {
    name: "Marcus Chen",
    role: "Lead Architect",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    bio: "Writes headless CMS architectures in his sleep. His code is as clean as his sneaker collection."
  },
  {
    name: "Sarah Jenkins",
    role: "Growth Strategist",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
    bio: "Turns traffic into revenue. If your conversion rate is under 5%, she takes it personally."
  }
];

export default function About() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-30" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Built Different.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We aren't just another agency. We're a collective of digital engineers obsessed with pushing the boundaries of what's possible on the web.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Why */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[50px]" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[50px]" />
            
            <h2 className="text-3xl font-heading font-bold mb-8 relative z-10">The Nexus Philosophy</h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed relative z-10">
              Most agencies build websites. We build digital ecosystems. We believe that in a saturated digital landscape, the only way to win is through extreme differentiation. That means uncompromising design, bleeding-edge performance, and architectures built specifically for your industry's unique physics.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values Bento */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 rounded-2xl md:col-span-2 glow-hover"
            >
              <h3 className="text-2xl font-heading font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground text-lg">
                To equip ambitious brands with the digital infrastructure required to completely dominate their respective markets. We don't play for second place.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 rounded-2xl bg-primary/10 border-primary/20 glow-hover"
            >
              <h3 className="text-xl font-heading font-bold mb-2">Zero Compromise</h3>
              <p className="text-muted-foreground">We never sacrifice performance for aesthetics, or vice versa.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 rounded-2xl glow-hover"
            >
              <h3 className="text-xl font-heading font-bold mb-2">Radical Transparency</h3>
              <p className="text-muted-foreground">No black boxes. You see exactly what we're building and why.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8 rounded-2xl glow-hover"
            >
              <h3 className="text-xl font-heading font-bold mb-2">Industry Specificity</h3>
              <p className="text-muted-foreground">A plumber doesn't need a photographer's site. Context matters.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 rounded-2xl bg-primary/5 glow-hover"
            >
              <h3 className="text-xl font-heading font-bold mb-2">Constant Evolution</h3>
              <p className="text-muted-foreground">The web moves fast. We move faster. Our stack is always evolving.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">The Architects</h2>
            <p className="text-muted-foreground text-lg">The minds behind the machines.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-2xl overflow-hidden glow-hover group"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
