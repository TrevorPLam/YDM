import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageTransition } from "@/components/PageTransition";
import { blogPosts } from "@/data/posts";
import { Clock, ArrowRight } from "lucide-react";

export default function BlogList() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Nexus Insights.</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tactical playbooks, architectural teardowns, and digital strategies for market leaders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden glow-hover group flex flex-col h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md bg-black/40 border-white/10">
                      {post.category}
                    </span>
                  </div>
                </Link>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-medium">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-heading font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <Link 
                    href={`/blog/${post.slug}`} 
                    className="inline-flex items-center text-sm font-medium text-primary group-hover:text-white transition-colors mt-auto"
                  >
                    Read Article <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
