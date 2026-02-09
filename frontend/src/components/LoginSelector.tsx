import { useState } from 'react';
import { useConnectWallet } from '@mysten/dapp-kit';
import { GlitchModal } from '@/components/ui/GlitchModal';
import { Wallet, Globe, ScanFace, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerAlert } from '@/components/ui/SystemAlert';

// --- Configuration ---
// TODO: Replace with actual Google Client ID from Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/auth/callback';

interface LoginSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSelector({ isOpen, onClose }: LoginSelectorProps) {
  const { mutate: connectWallet } = useConnectWallet();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleWalletLogin = () => {
    // Open the default Sui Wallet selector
    // Note: The dApp Kit connectWallet hook expects a specific wallet object.
    // If we call it with {}, it fails inside the hook when trying to access 'wallet.features'.
    // We should NOT call connectWallet manually if we want to use the default modal.
    // Instead, we should use the ConnectButton or trigger the modal open state.
    
    // However, since we are building a custom UI, we might be using the wrong hook.
    // useConnectWallet is for connecting to a KNOWN wallet instance.
    // If we want to open the modal, we need to use the context or store that controls the modal visibility.
    
    // Checking @mysten/dapp-kit docs/source:
    // The ConnectModal is usually controlled by the ConnectButton. 
    // There isn't a direct "useConnectModal" hook exposed publicly in early versions, 
    // but we can try to simulate a click on a hidden ConnectButton or check if there is another way.
    
    // WORKAROUND:
    // Since we can't easily access the internal modal state, we will trigger a click on a hidden ConnectButton.
    // This is a hack but ensures we use the standard flow.
    const hiddenBtn = document.getElementById('engram-hidden-connect-btn');
    if (hiddenBtn) {
        onClose();
        setTimeout(() => hiddenBtn.click(), 100);
    } else {
        console.error("Hidden connect button not found");
        triggerAlert({
            type: 'error',
            title: 'CONNECTION ERROR',
            message: 'Could not initiate wallet connection protocol.'
        });
    }
  };

  const handleZkLogin = () => {
    setIsRedirecting(true);
    
    // 1. Generate Nonce (Mocking the randomness for now)
    // In production: import { generateNonce } from '@mysten/sui/zklogin';
    // const nonce = generateNonce(userPublicKey, maxEpoch, randomness);
    const mockNonce = 'mock_nonce_' + Math.random().toString(36).substring(7);

    // 2. Construct OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      response_type: 'id_token',
      redirect_uri: REDIRECT_URI,
      scope: 'openid email profile',
      nonce: mockNonce,
      state: 'engram_login_state' 
    });

    const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // 3. Redirect (Simulated delay for effect)
    setTimeout(() => {
        // window.location.href = loginUrl; 
        // Since we don't have a real Client ID, we alert instead of breaking the flow
        triggerAlert({
          type: 'warning',
          title: 'PROTOCOL PENDING',
          message: `Redirecting to Google OAuth... (Feature Pending: Requires valid GOOGLE_CLIENT_ID)\nURL: ${loginUrl}`,
          duration: 8000
        });
        setIsRedirecting(false);
        onClose(); 
    }, 1500);
  };

  return (
    <GlitchModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ACCESS PROTOCOL"
      className="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Neural Link (Wallet) */}
        <button
          onClick={handleWalletLogin}
          className="group relative h-64 border border-titanium-grey/30 bg-white/5 hover:bg-neon-cyan/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-4 rounded-full border border-neon-cyan/50 bg-void-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <Wallet size={48} className="text-neon-cyan" />
          </div>
          
          <div className="text-center z-10">
            <h3 className="text-xl font-heading text-neon-cyan tracking-widest mb-2 group-hover:text-white transition-colors">
              NEURAL LINK
            </h3>
            <p className="text-xs font-mono text-titanium-grey max-w-[150px] mx-auto">
              Standard interface connection via browser extension.
            </p>
          </div>

          <div className="absolute bottom-4 text-[10px] text-titanium-grey/50 font-mono group-hover:text-neon-cyan/70">
            [ SUI_WALLET_COMPATIBLE ]
          </div>
        </button>

        {/* Option 2: Biometric (zkLogin) */}
        <button
          onClick={handleZkLogin}
          disabled={isRedirecting}
          className="group relative h-64 border border-titanium-grey/30 bg-white/5 hover:bg-matrix-green/10 transition-all duration-300 flex flex-col items-center justify-center gap-4 overflow-hidden"
        >
           {isRedirecting && (
             <div className="absolute inset-0 bg-void-black/90 z-20 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-1 bg-matrix-green animate-pulse" />
                <div className="text-xs font-mono text-matrix-green animate-pulse">ESTABLISHING LINK...</div>
             </div>
           )}

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-matrix-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-4 rounded-full border border-matrix-green/50 bg-void-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <ScanFace size={48} className="text-matrix-green" />
          </div>
          
          <div className="text-center z-10">
            <h3 className="text-xl font-heading text-matrix-green tracking-widest mb-2 group-hover:text-white transition-colors">
              BIOMETRIC AUTH
            </h3>
            <p className="text-xs font-mono text-titanium-grey max-w-[150px] mx-auto">
              Zero-Knowledge proof authentication via Google OAuth.
            </p>
          </div>

          <div className="absolute bottom-4 text-[10px] text-titanium-grey/50 font-mono group-hover:text-matrix-green/70">
            [ POWERED_BY_ZKLOGIN ]
          </div>
        </button>
      </div>

      <div className="mt-6 p-3 border border-glitch-red/20 bg-glitch-red/5 rounded flex items-start gap-3">
         <Lock size={16} className="text-glitch-red mt-0.5 shrink-0" />
         <div className="text-[10px] text-titanium-grey">
           <span className="text-glitch-red font-bold">SECURITY NOTICE:</span> Both methods generate a unique, non-custodial address on the Sui Network. 
           Your biometric data (OAuth) generates a proof without revealing your identity on-chain.
         </div>
      </div>
    </GlitchModal>
  );
}
