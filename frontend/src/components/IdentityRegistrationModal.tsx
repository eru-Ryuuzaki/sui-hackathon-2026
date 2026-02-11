import { useState, useEffect } from 'react';
import { GlitchModal } from '@/components/ui/GlitchModal';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { User, Calendar, Cpu, ArrowRight} from 'lucide-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useGlobalLoader } from '@/components/ui/GlobalLoader';
import axios from 'axios';

interface IdentityRegistrationModalProps {
  isOpen: boolean;
  onConfirm: (codename: string, birthday: string) => void;
  defaultCodename?: string;
}

export function IdentityRegistrationModal({ isOpen, onConfirm, defaultCodename = '' }: IdentityRegistrationModalProps) {
  const account = useCurrentAccount();
  const loader = useGlobalLoader();
  const [codename, setCodename] = useState(defaultCodename);
  const [birthday, setBirthday] = useState('2000-01-01'); // Default to Y2K for better UX
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill codename when prop changes
  useEffect(() => {
    if (defaultCodename) {
        setCodename(defaultCodename);
    }
  }, [defaultCodename]);

  const handleSubmit = () => {
    // Validation
    if (codename.length < 2 || codename.length > 20) {
      triggerAlert({ type: 'error', title: 'INVALID IDENTITY', message: 'Codename must be 2-20 characters.' });
      return;
    }
    // Birthday is optional now
    /*
    if (!birthday) {
      triggerAlert({ type: 'error', title: 'MISSING DATA', message: 'Origin date (birthday) is required for life-frame calculation.' });
      return;
    }
    */

    setIsSubmitting(true);
    loader.show("INITIALIZING NEURAL IDENTITY...");
    
    // Reset state after a delay (handled by parent closing modal)
    setTimeout(() => {
       // Reset states only after the delay
       setIsSubmitting(false);
       loader.hide();
       // onConfirm will trigger parent state change (setIsRegistering(false)) which closes modal
       // We delay it slightly so the loader finishes first or simultaneously
       onConfirm(codename, birthday || '2000-01-01');
    }, 1000);
  };

  return (
    <GlitchModal 
      isOpen={isOpen} 
      onClose={() => {}} // Prevent closing without submission
      title="IDENTITY PROTOCOL"
      className="max-w-md border-neon-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.15)] relative overflow-hidden"
    >
      <div className="space-y-6 font-mono relative z-10">
        <div className="text-xs text-titanium-grey border-l-2 border-neon-cyan pl-2 py-1">
          &gt; UNREGISTERED CONSCIOUSNESS DETECTED.<br/>
          &gt; PLEASE ESTABLISH YOUR DIGITAL IDENTITY.
        </div>

        {/* Codename Input */}
        <div className="space-y-2 group">
          <label className="text-[10px] text-neon-cyan flex items-center gap-2 group-focus-within:text-white transition-colors">
            <User size={12} /> CODENAME / ALIAS
          </label>
          <div className="relative">
             <input
               type="text"
               value={codename}
               onChange={(e) => setCodename(e.target.value)}
               placeholder="Enter your handle..."
               className="w-full bg-white/5 border border-titanium-grey/50 px-3 py-2 text-white focus:border-neon-cyan outline-none transition-all placeholder:text-titanium-grey/30"
               autoFocus
             />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-titanium-grey/50 pointer-events-none">
               {codename.length}/20
             </div>
          </div>
        </div>

        {/* Birthday Input */}
        <div className="space-y-2 group">
          <label className="text-[10px] text-neon-cyan flex items-center gap-2 group-focus-within:text-white transition-colors">
            <Calendar size={12} /> ORIGIN DATE <span className="text-titanium-grey/50">(OPTIONAL)</span>
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-white/5 border border-titanium-grey/50 px-3 py-2 text-white focus:border-neon-cyan outline-none transition-all [color-scheme:dark]"
          />
          <div className="text-[10px] text-titanium-grey/70 italic">
            * Used for Life Frame synchronization if provided.
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full group relative overflow-hidden bg-neon-cyan/10 border border-neon-cyan/50 hover:bg-neon-cyan hover:text-void-black text-neon-cyan py-3 transition-all duration-300"
        >
          <div className="flex items-center justify-center gap-2 relative z-10 font-bold tracking-widest">
            {isSubmitting ? (
              <>
                <Cpu size={16} className="animate-spin" /> INITIALIZING...
              </>
            ) : (
              <>
                <Cpu size={16} /> INITIALIZE LINK <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
          
          {/* Scanline overlay on button */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-100 pointer-events-none" />
        </button>
      </div>
    </GlitchModal>
  );
}
