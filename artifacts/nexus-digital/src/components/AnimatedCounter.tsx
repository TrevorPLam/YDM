import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({ value, suffix = "", prefix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration: duration * 1000
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [motionValue, inView, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      // Format number to 1 decimal if the value itself has decimals
      const hasDecimals = value % 1 !== 0;
      setDisplayValue(
        hasDecimals ? latest.toFixed(1) : Math.round(latest).toString()
      );
    });
  }, [springValue, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{displayValue}{suffix}
    </span>
  );
}
