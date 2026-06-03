import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variants = {
  default: 'bg-white border border-border',
  elevated: 'bg-white shadow-lg',
  outline: 'bg-transparent border-2 border-border'
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', padding = 'md', hoverable = false, children, ...props }, ref) => {
    const Component = hoverable ? motion.div : 'div';
    const hoverProps = hoverable ? { whileHover: { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } } : {};

    return (
      <Component
        ref={ref}
        className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${hoverable ? 'cursor-pointer transition-shadow' : ''} ${className}`}
        {...hoverProps}
        {...props}>

        {children}
      </Component>);

  }
);

Card.displayName = 'Card';

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-ev-id="ev_cecaf98bbb" className={`mb-4 ${className}`} {...props}>
      {children}
    </div>);

}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 data-ev-id="ev_73f81ffda9" className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>);

}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-ev-id="ev_f8aee35f21" className={className} {...props}>
      {children}
    </div>);

}