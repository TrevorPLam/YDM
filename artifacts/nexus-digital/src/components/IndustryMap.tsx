import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { industries } from "@/data/industries";

export function IndustryMap() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Position nodes in a rough circle/network layout
  const nodes = industries.map((ind, i) => {
    const angle = (i / industries.length) * Math.PI * 2;
    const radius = window.innerWidth < 768 ? 120 : 250;
    
    // Add some random jitter for a more organic network feel
    const jitterX = Math.sin(i * 13) * 20;
    const jitterY = Math.cos(i * 17) * 20;
    
    return {
      ...ind,
      x: Math.cos(angle) * radius + jitterX,
      y: Math.sin(angle) * radius + jitterY,
    };
  });

  return (
    <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Lines between nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="-350 -350 700 700">
        <g transform="translate(0, 0)">
          {nodes.map((node, i) => {
            const nextNode = nodes[(i + 1) % nodes.length];
            const oppNode = nodes[(i + 5) % nodes.length];
            return (
              <g key={`lines-${node.slug}`}>
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={nextNode.x}
                  y2={nextNode.y}
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={oppNode.x}
                  y2={oppNode.y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}
        </g>
      </svg>

      <div className="relative w-full h-full max-w-[800px] mx-auto flex items-center justify-center">
        {nodes.map((node) => (
          <div
            key={node.slug}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `calc(50% + ${node.x}px)`, 
              top: `calc(50% + ${node.y}px)` 
            }}
            onMouseEnter={() => setHoveredNode(node.slug)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="relative z-10"
            >
              <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(0,91,181,0.8)] cursor-pointer" />
            </motion.div>

            <AnimatePresence>
              {hoveredNode === node.slug && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-50 top-6 left-1/2 -translate-x-1/2 w-64 glass-card p-4 rounded-lg pointer-events-none md:pointer-events-auto"
                >
                  <h4 className="font-heading font-bold text-foreground mb-1">{node.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{node.description}</p>
                  <Link href={`/industries/${node.slug}`} className="text-primary text-xs font-medium hover:underline pointer-events-auto">
                    Explore Industry &rarr;
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
