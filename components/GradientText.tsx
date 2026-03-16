import { ReactNode, ElementType } from 'react';

interface GradientTextProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export default function GradientText({ as: Tag = 'h2', children, className = '' }: GradientTextProps) {
  return (
    <Tag className={`gradient-text ${className}`}>
      {children}
    </Tag>
  );
}
