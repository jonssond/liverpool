import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  let baseClasses = 'font-bold uppercase tracking-wider transition rounded-xl border-none cursor-pointer text-center select-none active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed';
  
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      // Amber Quente (#D97724)
      variantClasses = 'bg-warm-amber hover:bg-warm-amber/90 text-paper-white shadow-[0_4px_12px_rgba(217,119,36,0.25)]';
      break;
    case 'secondary':
      // Verde Oliva (#4A5844)
      variantClasses = 'bg-faded-olive hover:bg-faded-olive/90 text-paper-white';
      break;
    case 'danger':
      variantClasses = 'bg-rose-600 hover:bg-rose-700 text-white';
      break;
    case 'success':
      variantClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white';
      break;
    case 'outline':
      variantClasses = 'bg-transparent border border-faded-olive/40 hover:bg-faded-olive/5 text-faded-olive';
      // override base border-none
      baseClasses = baseClasses.replace('border-none', '');
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'px-3 py-1.5 text-[10px]';
      break;
    case 'md':
      sizeClasses = 'px-4 py-2.5 text-xs';
      break;
    case 'lg':
      sizeClasses = 'px-6 py-3.5 text-sm';
      break;
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
