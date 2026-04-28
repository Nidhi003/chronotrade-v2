import React from 'react';
import { cn } from '@/lib/utils';

export const Button = ({ className, variant = 'default', size = 'default', asChild = false, ...props }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-white/20 bg-transparent hover:bg-white/10 text-white',
    ghost: 'hover:bg-white/10 text-white',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const Comp = asChild ? 'span' : 'button';

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
