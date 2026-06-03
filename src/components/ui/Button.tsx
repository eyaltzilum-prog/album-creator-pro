import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  outline: 'border border-border bg-transparent hover:bg-muted',
  ghost: 'hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2 rounded-md font-medium
          transition-colors focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        disabled={disabled || loading}
        {...props}>

        {loading &&
        <svg data-ev-id="ev_91bcfb2037" className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle data-ev-id="ev_a01fad7ffd" className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path data-ev-id="ev_aba9530e65" className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        }
        {children}
      </motion.button>);

  }
);

Button.displayName = 'Button';