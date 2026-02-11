import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { create } from 'zustand';

interface GlobalLoaderState {
  isLoading: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
}

export const useGlobalLoader = create<GlobalLoaderState>((set) => ({
  isLoading: false,
  message: undefined,
  show: (message) => set({ isLoading: true, message }),
  hide: () => set({ isLoading: false, message: undefined }),
}));

export function GlobalLoader() {
  const { isLoading, message } = useGlobalLoader();

  return createPortal(
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void-black/80 backdrop-blur-sm"
        >
          {/* Cyberpunk Scanline Background */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

          <div className="relative flex flex-col items-center gap-6 p-8 border border-neon-cyan/30 bg-void-black/90 shadow-[0_0_30px_rgba(0,243,255,0.1)] max-w-sm w-full mx-4">
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-neon-cyan" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-neon-cyan" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-neon-cyan" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-neon-cyan" />

            {/* Spinner */}
            <div className="relative">
              <Loader2 size={48} className="text-neon-cyan animate-spin" />
              <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-full animate-pulse" />
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className="text-neon-cyan font-bold tracking-[0.2em] text-sm animate-pulse">
                PROCESSING
              </h3>
              {message && (
                <p className="text-titanium-grey text-xs font-mono border-t border-titanium-grey/20 pt-2 w-full">
                  &gt; {message}
                </p>
              )}
            </div>

            {/* Loading Bar */}
            <div className="w-full h-1 bg-titanium-grey/20 overflow-hidden relative">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-neon-cyan"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
