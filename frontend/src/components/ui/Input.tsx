import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefixText = "user@engram:~$", ...props }, ref) => {
    return (
      <div className="flex items-center w-full font-mono text-base group">
        <span className="text-neon-cyan mr-3 select-none whitespace-nowrap hidden sm:block">{prefixText}</span>
        <span className="text-neon-cyan mr-2 select-none whitespace-nowrap sm:hidden">{">"}</span>
        <input
          ref={ref}
          className={cn(
            "bg-transparent border-none outline-none flex-1 text-neon-cyan placeholder-titanium-grey/50",
            "focus:ring-0 p-0",
            className
          )}
          spellCheck={false}
          autoComplete="off"
          {...props}
        />
        <span className="w-2 h-5 bg-neon-cyan animate-pulse ml-1" />
      </div>
    );
  }
);
Input.displayName = "Input";
