import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface GlitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlitchModal({ isOpen, onClose, title = 'SYSTEM ALERT', children, className }: GlitchModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={cn(
              "relative w-full max-w-lg bg-void-black border-2 border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.3)]",
              "before:absolute before:-top-1 before:-left-1 before:w-3 before:h-3 before:bg-neon-cyan before:z-10",
              "after:absolute after:-bottom-1 after:-right-1 after:w-3 after:h-3 after:bg-neon-cyan after:z-10",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neon-cyan/30 bg-white/5">
              <div className="flex items-center gap-2 text-neon-cyan animate-pulse">
                <AlertTriangle size={18} />
                <h2 className="font-heading tracking-widest text-lg uppercase drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">
                  {title}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="text-titanium-grey hover:text-glitch-red transition-colors group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Decorative Lines */}
            <div className="absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-matrix-green to-neon-cyan opacity-50" />

            {/* Body */}
            <div className="p-6 relative overflow-hidden">
               {/* Scanline Overlay */}
               <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 bg-[length:100%_2px,3px_100%] opacity-20" />
               
               <div className="relative z-10">
                 {children}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
