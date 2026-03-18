'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  '/': {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  '/product': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  },
  '/team': {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
  },
  '/media': {
    initial: { opacity: 0, filter: 'blur(6px)' },
    animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.4 } },
    exit: { opacity: 0, filter: 'blur(3px)', transition: { duration: 0.2 } },
  },
  '/contact': {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const variant = pageVariants[pathname as keyof typeof pageVariants] || pageVariants['/'];

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  );
}
