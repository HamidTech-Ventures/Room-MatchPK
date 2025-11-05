'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -60 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 }
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const zoomIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export const slideUp = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 }
};

export const slideLeft = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 }
};

export const slideRight = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 }
};

export const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

export const flipIn = {
  hidden: { opacity: 0, rotateY: 90 },
  visible: { opacity: 1, rotateY: 0 }
};

// Default transition
export const defaultTransition = {
  duration: 0.8,
  ease: "easeOut"
};

// Stagger container for sequential animations
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Animation wrapper component
interface AnimatedSectionProps {
  children: ReactNode;
  variant?: any;
  delay?: number;
  duration?: number;
  className?: string;
  viewport?: { once?: boolean; amount?: number };
}

export function AnimatedSection({ 
  children, 
  variant = fadeInUp, 
  delay = 0, 
  duration = 0.8,
  className = "",
  viewport = { once: true, amount: 0.2 }
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variant}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Hover animation wrapper
interface HoverAnimatedProps {
  children: ReactNode;
  scale?: number;
  className?: string;
  whileHover?: any;
  whileTap?: any;
}

export function HoverAnimated({ 
  children, 
  scale = 1.02, 
  className = "",
  whileHover,
  whileTap = { scale: 0.98 }
}: HoverAnimatedProps) {
  const defaultHover = {
    scale,
    y: -2,
    transition: { duration: 0.2, ease: "easeInOut" }
  };

  return (
    <motion.div
      className={className}
      whileHover={whileHover || defaultHover}
      whileTap={whileTap}
    >
      {children}
    </motion.div>
  );
}
