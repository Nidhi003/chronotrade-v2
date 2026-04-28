"use client";
import React, { forwardRef, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const VerticalCutReveal = forwardRef(({
  children,
  splitBy = "words",
  staggerDuration = 0.2,
  containerClassName,
  autoStart = true,
  ...props
}, ref) => {
  const text = typeof children === "string" ? children : (children?.toString() || "");
  const [isAnimating, setIsAnimating] = useState(false);

  const elements = useMemo(() => {
    if (!text) return [];
    if (splitBy === "words") return text.split(" ");
    return Array.from(text);
  }, [text, splitBy]);

  useEffect(() => {
    if (autoStart) setIsAnimating(true);
  }, [autoStart]);

  const variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * staggerDuration, type: "spring", stiffness: 200, damping: 30 },
    }),
  };

  if (elements.length === 0) return <div className={containerClassName}>{text}</div>;

  return (
    <div
      ref={ref}
      className={cn("flex flex-row flex-wrap justify-center items-center text-center w-full", containerClassName)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      {elements.map((el, i) => (
        <span key={i} className="inline-flex overflow-hidden mr-2">
          <motion.span
            custom={i}
            initial="hidden"
            animate={isAnimating ? "visible" : "hidden"}
            variants={variants}
            className="inline-block"
          >
            {el}
          </motion.span>
        </span>
      ))}
    </div>
  );
});

VerticalCutReveal.displayName = "VerticalCutReveal";
export { VerticalCutReveal };
