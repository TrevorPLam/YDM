import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useBlogPosts } from "@/hooks/use-blog";
import { Clock, Search, Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { blogPosts, pagination } = useBlogPosts({
    page: currentPage,
    limit: 6,
    search: searchTerm || undefined,
    industrySlug: selectedCategory || undefined,
    orderBy: "published_at"
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920" 
            alt="Blog" 
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
              Insights & Strategies
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Expert guidance on digital transformation, SEO optimization, and growth strategies for modern businesses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-primary text-white"
                      : "glass-card text-muted-foreground hover:text-white"
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "glass-card text-muted-foreground hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {blogPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <h3 className="text-2xl font-heading font-bold text-white mb-4">
                No insights found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="glass-card px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md bg-white/5 border-white/10">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <Calendar className="w-3 h-3" />
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-heading font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                          {post.metaDescription || post.content.substring(0, 150) + '...'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-medium text-sm group-hover:underline">
                            Read More
                          </span>
                          <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center group-hover:bg-primary transition-colors">
                            <ChevronRight className="w-4 h-4 text-primary group-hover:text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-4 mt-16"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg text-sm font-medium text-muted-foreground hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      i === currentPage
                        ? "bg-primary text-white"
                        : "glass-card text-muted-foreground hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg text-sm font-medium text-muted-foreground hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-heading font-bold text-white mb-6">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get the latest insights on digital transformation, SEO strategies, and growth tips delivered to your inbox.
            </p>
            <div className="glass-card p-8 rounded-2xl border-white/10">
              <NewsletterSignup />
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
