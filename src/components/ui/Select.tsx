import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {value: string;label: string;}[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div data-ev-id="ev_35829ba274" className="flex flex-col gap-1.5">
        {label &&
        <label data-ev-id="ev_1b5f253a3f" htmlFor={selectId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        }
        <select data-ev-id="ev_e6516b8c35"
        ref={ref}
        id={selectId}
        className={`
            h-10 w-full rounded-md border border-border bg-white px-3 py-2
            text-base focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-destructive focus:ring-destructive' : ''}
            ${className}
          `}
        {...props}>

          {options.map((option) =>
          <option data-ev-id="ev_2645c81701" key={option.value} value={option.value}>
              {option.label}
            </option>
          )}
        </select>
        {error && <p data-ev-id="ev_d3bb87ec50" className="text-sm text-destructive">{error}</p>}
      </div>);

  }
);

Select.displayName = 'Select';