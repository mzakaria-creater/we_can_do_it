import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white dark:bg-[#161B22] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "bg-[#D4AF37] text-black hover:bg-[#C5A028] active:scale-95",
      secondary: "bg-[#6C5CE7] text-white hover:bg-[#5B4BC4] active:scale-95",
      outline: "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
      danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
      ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
};
