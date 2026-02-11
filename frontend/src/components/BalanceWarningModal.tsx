import { useEffect, useState } from 'react';
import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { GlitchModal } from '@/components/ui/GlitchModal';
import { Copy, RefreshCw } from 'lucide-react';
import { formatAddress } from '@mysten/sui/utils';

export function BalanceWarningModal() {
  const { currentUser } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  // Only run check if we have a ZK Login user
  const address = currentUser?.address;

  const { data: balanceData, refetch, isPending } = useSuiClientQuery(
    'getBalance',
    { owner: address! },
    { 
      enabled: !!address,
      refetchInterval: 10000 // Auto-refresh every 10s to see if they topped up
    }
  );

  useEffect(() => {
    if (!address) {
      setIsOpen(false);
      return;
    }

    if (balanceData) {
      const balance = BigInt(balanceData.totalBalance);
      // Threshold: 0.01 SUI (10,000,000 MIST)
      // If less than this, they probably can't do anything
      const MIN_REQUIRED_MIST = 10000000n; 

      if (balance < MIN_REQUIRED_MIST) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [balanceData, address]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!address) return null;

  return (
    <GlitchModal
      isOpen={isOpen}
      onClose={() => {
        // Optional: Allow closing? 
        // User requirement: "Popup... need to top up to use". 
        // Usually these are blocking or persistent. 
        // Let's allow closing so they can look around, but it will pop up again on refresh/re-check if logic dictates.
        // For better UX, maybe we just let them close it.
        setIsOpen(false); 
      }}
      title="INSUFFICIENT FUNDS"
      className="border-glitch-red shadow-[0_0_30px_rgba(255,50,50,0.3)]"
    >
      <div className="space-y-6 text-neon-cyan font-mono">
        <div className="p-4 bg-glitch-red/10 border border-glitch-red/50 text-glitch-red">
          <p className="font-bold text-lg mb-2">SYSTEM NOTICE</p>
          <p className="text-sm">
            Sponsor Signature functionality is currently under development. 
            To access the Neural Link, you must fund your construct manually.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-titanium-grey uppercase tracking-wider">Your Construct Address</label>
          <div className="flex items-center gap-2 p-3 bg-void-black border border-neon-cyan/30 rounded">
            <code className="flex-1 text-sm">{formatAddress(address)}</code>
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-neon-cyan/20 rounded transition-colors text-neon-cyan"
              title="Copy Address"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-xs text-titanium-grey">
            Current Balance: {balanceData ? Number(balanceData.totalBalance) / 1e9 : 0} SUI
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button 
             onClick={() => refetch()}
             className="flex items-center gap-2 px-4 py-2 text-xs border border-neon-cyan/30 hover:bg-neon-cyan/10 transition-colors"
          >
            <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
            REFRESH
          </button>
          <a 
            href={`https://suivision.xyz/account/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-neon-cyan text-void-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </GlitchModal>
  );
}
