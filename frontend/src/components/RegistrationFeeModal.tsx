import { GlitchModal } from '@/components/ui/GlitchModal';
import { Database, Cpu, Wallet, ShieldAlert } from 'lucide-react';

interface RegistrationFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RegistrationFeeModal({ isOpen, onClose, onConfirm }: RegistrationFeeModalProps) {
  return (
    <GlitchModal
      isOpen={isOpen}
      onClose={onClose}
      title="UPLINK INTERRUPTED"
      className="border-glitch-red shadow-[0_0_30px_rgba(255,50,50,0.3)]"
    >
      <div className="space-y-6 text-titanium-grey font-mono text-sm">
        
        {/* Warning Banner */}
        <div className="p-4 bg-glitch-red/10 border border-glitch-red/50 text-glitch-red flex gap-3 items-start">
          <ShieldAlert className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-sm mb-1 uppercase tracking-wider">Sponsor Node Offline</p>
            <p className="text-xs opacity-80 leading-relaxed">
              The automated sponsorship relay is currently under maintenance. 
              Manual gas fee payment is required to establish the Neural Link.
            </p>
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-neon-cyan text-xs font-bold uppercase tracking-widest border-b border-neon-cyan/20 pb-1">
                Data Transmission Packet
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/10">
                    <Database size={14} className="text-matrix-green" />
                    <div>
                        <div className="text-xs text-white">Identity Matrix</div>
                        <div className="text-[10px] opacity-60">Codename, Origin Date, Avatar Seed</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/10">
                    <Cpu size={14} className="text-matrix-green" />
                    <div>
                        <div className="text-xs text-white">Construct Initialization</div>
                        <div className="text-[10px] opacity-60">Memory Storage Allocation, Access Rights</div>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-void-black border border-neon-cyan/30 rounded text-xs space-y-2">
                <div className="flex justify-between items-center">
                    <span className="opacity-70">Estimated Network Fee:</span>
                    <span className="text-neon-cyan font-bold">~0.005 SUI</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="opacity-70">Status:</span>
                    <span className="text-glitch-red animate-pulse">AWAITING PAYMENT</span>
                </div>
            </div>
        </div>

        <div className="text-[10px] text-titanium-grey/60 italic text-center">
            * By proceeding, you confirm this data will be permanently engraved on the Sui Network.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
             onClick={onClose}
             className="px-4 py-2 text-xs border border-titanium-grey/30 hover:bg-white/5 transition-colors text-titanium-grey hover:text-white"
          >
            ABORT
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 bg-glitch-red text-void-black font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-glitch-red transition-all flex items-center gap-2"
          >
            <Wallet size={14} />
            Initialize Link
          </button>
        </div>
      </div>
    </GlitchModal>
  );
}
