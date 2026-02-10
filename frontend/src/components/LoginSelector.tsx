import { useState } from 'react';
import { useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
import { generateNonce, generateRandomness } from '@mysten/zklogin';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { GlitchModal } from '@/components/ui/GlitchModal';
import { Wallet, ScanFace, Lock, ChevronLeft, Download } from 'lucide-react';
import { triggerAlert } from '@/components/ui/SystemAlert';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const REDIRECT_URI = (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) || (window.location.origin + '/auth/callback');

interface LoginSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginSelector({ isOpen, onClose }: LoginSelectorProps) {
  const { mutate: connectWallet } = useConnectWallet();
  const wallets = useWallets();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [view, setView] = useState<'main' | 'wallet-list'>('main');

  const handleWalletSelect = (wallet: any) => {
    connectWallet(
      { wallet },
      {
        onSuccess: () => {
          onClose();
          triggerAlert({
             type: 'success',
             title: 'NEURAL LINK ESTABLISHED',
             message: `Connected to ${wallet.name}`,
          });
        },
        onError: (error) => {
          console.error("Connection failed:", error);
          triggerAlert({
            type: 'error',
            title: 'CONNECTION FAILURE',
            message: 'Neural link rejected by host.',
          });
        }
      }
    );
  };

  const handleZkLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      triggerAlert({
        type: 'warning',
        title: 'CONFIG REQUIRED',
        message: 'Missing VITE_GOOGLE_CLIENT_ID. Set it in .env and retry.',
        duration: 6000,
      });
      return;
    }
    setIsRedirecting(true);

    try {
      // 1. Prepare zkLogin parameters
      const client = new SuiJsonRpcClient({ 
        url: getJsonRpcFullnodeUrl('testnet'),
        network: 'testnet' as any
      });
      const { epoch } = await client.getLatestSuiSystemState();
      const maxEpoch = Number(epoch) + 2; // Valid for ~2 epochs (approx 48h)
      
      const ephemeralKeyPair = new Ed25519Keypair();
      const randomness = generateRandomness();
      const nonce = generateNonce(
        ephemeralKeyPair.getPublicKey(), 
        maxEpoch, 
        randomness
      );

      // 2. Store session data for callback verification & transaction signing
      sessionStorage.setItem('engram_oauth_nonce', nonce);
      sessionStorage.setItem('engram_zk_ephemeral_key', ephemeralKeyPair.getSecretKey());
      sessionStorage.setItem('engram_zk_max_epoch', String(maxEpoch));
      sessionStorage.setItem('engram_zk_randomness', randomness);

      // 3. Redirect to Google
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        response_type: 'id_token',
        redirect_uri: REDIRECT_URI,
        scope: 'openid email profile',
        state: 'engram_login_state',
        prompt: 'select_account',
        nonce,
      });
      const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      window.location.href = loginUrl;
    } catch (error) {
      console.error("zkLogin init failed:", error);
      setIsRedirecting(false);
      triggerAlert({
        type: 'error',
        title: 'INIT FAILURE',
        message: 'Could not initialize Zero-Knowledge parameters.',
      });
    }
  };

  const renderWalletList = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => setView('main')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-titanium-grey hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-heading text-neon-cyan tracking-widest">
          SELECT INTERFACE
        </h3>
      </div>

      <div className="grid gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {wallets.length === 0 ? (
          <div className="p-6 border border-dashed border-titanium-grey/30 rounded flex flex-col items-center text-center gap-3">
             <Download size={32} className="text-titanium-grey" />
             <p className="text-titanium-grey font-mono text-sm">
               No compatible neural interfaces (wallets) detected.
             </p>
             <a 
               href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbnyfyjmg" 
               target="_blank" 
               rel="noreferrer"
               className="text-neon-cyan hover:underline text-xs"
             >
               [INSTALL SUI WALLET]
             </a>
          </div>
        ) : (
          wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleWalletSelect(wallet)}
              className="flex items-center gap-4 p-4 border border-titanium-grey/20 bg-white/5 hover:bg-neon-cyan/10 hover:border-neon-cyan/50 transition-all group"
            >
              <img 
                src={wallet.icon} 
                alt={wallet.name} 
                className="w-8 h-8 rounded-sm grayscale group-hover:grayscale-0 transition-all"
              />
              <span className="font-mono text-sm text-titanium-grey group-hover:text-white">
                {wallet.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <GlitchModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="ACCESS PROTOCOL"
      className="max-w-2xl"
    >
      {view === 'wallet-list' ? renderWalletList() : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Neural Link (Wallet) */}
        <button
          onClick={() => setView('wallet-list')}
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
      )}

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
