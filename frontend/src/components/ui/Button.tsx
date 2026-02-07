import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: "border-titanium-grey text-neon-cyan hover:bg-neon-cyan hover:text-void-black",
      danger: "border-glitch-red text-glitch-red hover:bg-glitch-red hover:text-void-black",
      ghost: "border-transparent text-titanium-grey hover:text-neon-cyan"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "font-mono uppercase tracking-wider transition-all duration-200",
          "border px-6 py-2 bg-transparent flex items-center justify-center",
          "hover:translate-x-[2px]",
          "active:translate-x-0 active:translate-y-[2px]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:translate-x-0",
          variants[variant],
          className
        )}
        {...props}
      >
        {variant !== 'ghost' && <span className="mr-2">[</span>}
        {children}
        {variant !== 'ghost' && <span className="ml-2">]</span>}
      </button>
    );
  }
);
Button.displayName = "Button";
