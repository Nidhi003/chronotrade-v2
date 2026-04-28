"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TimelineContent = ({
  children,
  className,
  animationNum = 0,
  customVariants,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={customVariants}
      custom={animationNum}
      className={cn("opacity-0", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
