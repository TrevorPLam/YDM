import { motion } from "framer-motion";

export default function IndustrySkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 md:bg-background/60 backdrop-blur-[2px] z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background z-10" />
          <div className="w-full h-full bg-muted animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-6 w-32 bg-muted/50 rounded mb-6 mx-auto animate-pulse" />
            <div className="h-16 w-3/4 bg-muted/50 rounded mb-6 mx-auto animate-pulse max-w-2xl" />
            <div className="h-8 w-1/2 bg-muted/50 rounded mb-6 mx-auto animate-pulse max-w-xl" />
            <div className="h-6 w-full bg-muted/30 rounded mx-auto animate-pulse max-w-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Vision Section Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-card rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="h-10 w-48 bg-muted/50 rounded mb-10 animate-pulse" />
            
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-8 border-l border-white/10">
                  <div className="absolute top-0 -left-[5px] w-[9px] h-[9px] rounded-full bg-muted animate-pulse" />
                  <div className="h-6 w-32 bg-muted/50 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-full bg-muted/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Device Mockup Skeleton */}
      <section className="py-20 bg-black/20 border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-12 w-64 bg-muted/50 rounded mb-6 mx-auto animate-pulse" />
            <div className="h-10 w-48 bg-muted/30 rounded mb-4 mx-auto animate-pulse" />
          </div>
          
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="w-full max-w-5xl aspect-video rounded-t-xl rounded-b-md bg-muted/20 border border-white/10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Resources Section Skeleton */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="h-12 w-64 bg-muted/50 rounded mb-4 mx-auto animate-pulse" />
            <div className="h-6 w-48 bg-muted/30 rounded mx-auto animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-8 rounded-2xl animate-pulse">
                <div className="w-12 h-12 bg-muted/50 rounded-xl mb-6" />
                <div className="h-6 w-32 bg-muted/50 rounded mb-3" />
                <div className="h-4 w-full bg-muted/30 rounded mb-6" />
                <div className="h-10 w-full bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
