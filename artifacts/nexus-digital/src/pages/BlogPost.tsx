import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useBlogPost } from "@/hooks/use-blog";
import { useBlogPosts } from "@/hooks/use-blog";
import NotFound from "./not-found";
import { Clock, ArrowLeft, Twitter, Linkedin, Facebook } from "lucide-react";

// TODO: Add react-helmet-async for SEO metadata
// import { Helmet } from "react-helmet-async";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  
  if (!match || !params?.slug) return <NotFound />;
  
  try {
    const post = useBlogPost(params.slug);
    
    // Get related posts (excluding current post)
    const { blogPosts: allPosts } = useBlogPosts({ limit: 10 });
    const relatedPosts = allPosts.filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/blog" className="text-primary hover:text-white transition-colors mb-8 inline-flex items-center text-sm font-medium">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Insights
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md bg-white/5 border-white/10">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">{post.title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{post.metaDescription || post.content.substring(0, 150) + '...'}</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Article */}
            <div className="lg:col-span-8">
              <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-a:text-primary prose-img:rounded-2xl"
              >
                <img src={post.imageUrl} alt={post.title} className="w-full aspect-video object-cover mb-12 border border-white/10 shadow-2xl" />
                
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}

                <div className="my-12 p-8 glass-card rounded-2xl border-l-4 border-l-primary bg-primary/5">
                  <h3 className="text-xl font-heading font-bold text-white mt-0 mb-4">Want these results for your business?</h3>
                  <p className="text-muted-foreground mb-0">We build high-performance digital platforms tailored specifically for {post.category.toLowerCase()} businesses. Stop losing leads to slow, outdated websites.</p>
                </div>

                {/* Share Strip */}
                <div className="flex items-center gap-4 py-8 border-y border-white/10 mt-12">
                  <span className="text-sm font-medium text-muted-foreground">Share this insight:</span>
                  <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              <div>
                <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Related Insights
                </h3>
                <div className="space-y-6">
                  {relatedPosts.map(related => (
                    <Link key={related.slug} href={`/blog/${related.slug}`} className="group block">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={related.imageUrl} alt={related.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                          <h4 className="font-heading font-bold text-sm leading-tight group-hover:text-primary transition-colors mb-2 line-clamp-2">{related.title}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {related.readTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-2xl border-white/10">
                <NewsletterSignup />
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </PageTransition>
  );
  } catch (error) {
    return <NotFound />;
  }
}
