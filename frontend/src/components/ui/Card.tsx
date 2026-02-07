import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  decoration?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, decoration = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative border border-titanium-grey bg-void-black/90 backdrop-blur-sm p-4",
          decoration && "before:absolute before:-top-[1px] before:-left-[1px] before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:border-neon-cyan after:absolute after:-bottom-[1px] after:-right-[1px] after:w-3 after:h-3 after:border-b-2 after:border-r-2 after:border-neon-cyan",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
