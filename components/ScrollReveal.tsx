'use client';
import { useEffect, useRef, ReactNode, ElementType } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number; // 0-4
  className?: string;
  as?: ElementType;
}

export default function ScrollReveal({ children, delay = 0, className = '', as: Tag = 'div' }: ScrollRevealProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          if (delay > 0) el.classList.add(`delay-${delay}`);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </Tag>
  );
}
