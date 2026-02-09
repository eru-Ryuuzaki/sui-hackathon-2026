import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertOptions {
  title?: string;
  message: React.ReactNode;
  type?: AlertType;
  duration?: number; // Auto-close duration in ms (0 = no auto-close)
  onClose?: () => void;
}

// Global Event Bus for Alerts
const alertListeners = new Set<(alert: AlertOptions & { id: string }) => void>();

export const triggerAlert = (options: AlertOptions) => {
  const id = Math.random().toString(36).substring(7);
  alertListeners.forEach(listener => listener({ ...options, id }));
};

export function SystemAlert() {
  const [alerts, setAlerts] = useState<(AlertOptions & { id: string })[]>([]);

  useEffect(() => {
    const handler = (newAlert: AlertOptions & { id: string }) => {
      setAlerts(prev => [...prev, newAlert]);
      
      if (newAlert.duration !== 0) {
        const duration = newAlert.duration || 5000;
        setTimeout(() => {
          removeAlert(newAlert.id);
        }, duration);
      }
    };

    alertListeners.add(handler);
    return () => { alertListeners.delete(handler); };
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return createPortal(
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto"
          >
            <CyberAlertCard 
              alert={alert} 
              onClose={() => {
                removeAlert(alert.id);
                alert.onClose?.();
              }} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function CyberAlertCard({ alert, onClose }: { alert: AlertOptions, onClose: () => void }) {
  const styles = {
    info: {
      border: 'border-neon-cyan',
      bg: 'bg-neon-cyan/10',
      text: 'text-neon-cyan',
      icon: <Info size={18} />
    },
    success: {
      border: 'border-matrix-green',
      bg: 'bg-matrix-green/10',
      text: 'text-matrix-green',
      icon: <CheckCircle size={18} />
    },
    warning: {
      border: 'border-acid-yellow',
      bg: 'bg-acid-yellow/10',
      text: 'text-acid-yellow',
      icon: <AlertTriangle size={18} />
    },
    error: {
      border: 'border-glitch-red',
      bg: 'bg-glitch-red/10',
      text: 'text-glitch-red',
      icon: <XCircle size={18} />
    }
  };

  const style = styles[alert.type || 'info'];

  return (
    <div className={cn(
      "relative overflow-hidden border backdrop-blur-md bg-void-black/90 p-4 shadow-lg transition-all",
      style.border,
      "before:absolute before:inset-0 before:opacity-10 before:z-0",
      style.bg
    )}>
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-0 bg-[length:100%_2px,3px_100%] opacity-20" />

      <div className="relative z-10 flex gap-3">
        <div className={cn("mt-0.5 animate-pulse", style.text)}>
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {alert.title && (
            <h4 className={cn("font-heading tracking-widest text-sm font-bold mb-1", style.text)}>
              {alert.title}
            </h4>
          )}
          <div className="text-xs font-mono text-titanium-grey break-words leading-relaxed">
            {alert.message}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-titanium-grey hover:text-white transition-colors shrink-0 -mt-1 -mr-1 p-1"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress Bar (if auto-close) */}
      {alert.duration !== 0 && (
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (alert.duration || 5000) / 1000, ease: 'linear' }}
          className={cn("absolute bottom-0 left-0 h-0.5", style.bg.replace('/10', ''))}
        />
      )}
    </div>
  );
}
