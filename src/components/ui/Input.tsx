import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div data-ev-id="ev_332ead9196" className="flex flex-col gap-1.5">
        {label &&
        <label data-ev-id="ev_3a6eadd08a" htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        }
        <input data-ev-id="ev_1322a733eb"
        ref={ref}
        id={inputId}
        className={`
            h-10 w-full rounded-md border border-border bg-white px-3 py-2
            text-base placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-destructive focus:ring-destructive' : ''}
            ${className}
          `}
        {...props} />

        {error && <p data-ev-id="ev_addde263d4" className="text-sm text-destructive">{error}</p>}
        {hint && !error && <p data-ev-id="ev_1b895013e0" className="text-sm text-muted-foreground">{hint}</p>}
      </div>);

  }
);

Input.displayName = 'Input';