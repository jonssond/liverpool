import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
  'data-cy'?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, wrapperClassName = '', className = '', 'data-cy': dataCy, ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1.5 text-left ${wrapperClassName}`}>
        <label className="text-xs font-bold text-faded-olive">{label}</label>
        <input
          ref={ref}
          data-cy={dataCy}
          className={`w-full bg-paper-white border ${
            error ? 'border-rose-500' : 'border-faded-olive/40'
          } rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-warm-amber transition placeholder-faded-olive/40 text-vinyl-black ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-rose-600" data-cy={`${dataCy || 'input'}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  error?: string;
  wrapperClassName?: string;
  'data-cy'?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, wrapperClassName = '', className = '', 'data-cy': dataCy, ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1.5 text-left ${wrapperClassName}`}>
        <label className="text-xs font-bold text-faded-olive">{label}</label>
        <select
          ref={ref}
          data-cy={dataCy}
          className={`w-full bg-paper-white border ${
            error ? 'border-rose-500' : 'border-faded-olive/40'
          } rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-warm-amber transition text-vinyl-black ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-[10px] font-bold text-rose-600" data-cy={`${dataCy || 'select'}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
  'data-cy'?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, wrapperClassName = '', className = '', 'data-cy': dataCy, ...props }, ref) => {
    return (
      <div className={`flex flex-col space-y-1.5 text-left ${wrapperClassName}`}>
        <label className="text-xs font-bold text-faded-olive">{label}</label>
        <textarea
          ref={ref}
          data-cy={dataCy}
          className={`w-full bg-paper-white border ${
            error ? 'border-rose-500' : 'border-faded-olive/40'
          } rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-warm-amber transition placeholder-faded-olive/40 text-vinyl-black ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-rose-600" data-cy={`${dataCy || 'textarea'}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
