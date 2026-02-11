import { Card } from '@/components/ui/Card';
import { useCurrentAccount, useDisconnectWallet, ConnectButton, useSuiClientQuery } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { CyberAvatar } from '@/components/ui/CyberAvatar';
import { LoginSelector } from '@/components/LoginSelector';
import { useState, useMemo } from 'react';
import { Power, Radio, Eye, EyeOff } from 'lucide-react';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { formatBalance } from '@/utils/formatAmount';

export function HUD() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { currentUser, updateAvatar, logout } = useUserStore(); 
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  const [hasRerolledInHover, setHasRerolledInHover] = useState(false); 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false); // Local loading state
  
  // Balance Visibility State (Default: Visible)
  const [showBalance, setShowBalance] = useState(() => {
    return localStorage.getItem('ENGRAM_SHOW_BALANCE') !== 'false';
  });

  const toggleBalance = () => {
    const newState = !showBalance;
    setShowBalance(newState);
    localStorage.setItem('ENGRAM_SHOW_BALANCE', String(newState));
  };

  // Fetch Balance
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    { owner: account?.address || '' },
    { enabled: !!account, refetchInterval: 5000 }
  );

  // Debugging: Log balance data
  // console.log('Wallet Address:', account?.address);
  // console.log('Balance Data:', balanceData);

  // ... rest of logic ...
  // Determine effective connection state (Wallet OR zkLogin)
  const isConnected = !!account || !!currentUser;
  const currentAddress = account?.address || currentUser?.address;
  const connectionType = account ? 'WALLET' : 'ZKLOGIN';
  
  // Calculate Energy (10 Bars)
  const energyState = useMemo(() => {
    if (!balanceData) return { bars: 0, text: '0 SUI', level: 'low' };
    
    const rawBalance = BigInt(balanceData.totalBalance);
    const sui = Number(rawBalance) / 1_000_000_000; // MIST to SUI
    
    // Logic: 1 SUI = 100% (10 Bars). Max cap at 10.
    // 0.1 SUI = 1 Bar
    const bars = Math.min(10, Math.floor(sui * 10)); 
    
    let level = 'normal';
    if (sui < 0.1) level = 'critical'; // < 0.1 SUI (Red)
    else if (sui < 0.2) level = 'warning'; // 0.1 <= sui < 0.2 SUI (Yellow)

    return {
      bars,
      text: formatBalance(rawBalance) + ' SUI',
      level
    };
  }, [balanceData]);

  // Mock Stats
  const stats = {
    level: isConnected ? 1 : 0,
    exp: isConnected ? '0/1000' : '0/0',
    energy: isConnected ? energyState.bars : 0, 
    status: isConnected ? 'ONLINE' : 'OFFLINE'
  };

  const handleLoginClick = () => {
      setIsLoginLoading(true);
      // Simulate connection delay for better UX (or wait for modal to be ready)
      setTimeout(() => {
          setIsLoginOpen(true);
          setIsLoginLoading(false);
      }, 500);
  };

  const handleDisconnect = () => {
      if (account) disconnect();
      logout();
  };

  const handleAvatarClick = () => {
    if (!isConnected || !currentUser || isRerolling) return;
    
    setIsRerolling(true);
    
    // Play glitch animation for 300ms then update
    setTimeout(() => {
       const newSeed = Math.random().toString(36).substring(7);
       if (currentAddress) updateAvatar(currentAddress, newSeed);
       setIsRerolling(false);
       setHasRerolledInHover(true); // Mark as rerolled to stop glitch loop

       triggerAlert({
         type: 'success',
         title: 'IDENTITY RECONFIGURED',
         message: 'Digital avatar hash successfully updated.',
         duration: 2000
       });
    }, 300);
  };

  const handleMouseLeave = () => {
    setIsHoveringAvatar(false);
    setHasRerolledInHover(false); // Reset for next interaction
  };

  return (
    <aside className="lg:col-span-3 space-y-6 flex flex-col h-full min-h-0">
      <LoginSelector isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <Card className="shrink-0">
        <div className="flex items-center gap-3 mb-2">
            <img src="/favicon.png" alt="Engram Logo" className="w-8 h-8 drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]" />
            <h1 className="text-3xl font-bold font-heading tracking-widest text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">ENGRAM</h1>
        </div>
        <div className="text-xs text-titanium-grey mb-4 flex items-center gap-2">
           <span>Ver 1.0.0</span>
           <span className="w-1 h-1 bg-neon-cyan rounded-full animate-pulse" />
           <span className="text-neon-cyan/70">NET_ACTIVE</span>
        </div>
        
        <div className="flex justify-center mb-6">
           {/* Hidden Connect Button for Programmatic Access */}
           <div className="hidden">
             <ConnectButton 
               id="engram-hidden-connect-btn"
               connectText="CONNECT"
             />
           </div>

           {!isConnected ? (
             <button 
               onClick={handleLoginClick}
               disabled={isLoginLoading}
               className={`group relative px-6 py-2 bg-transparent border font-mono text-sm tracking-widest overflow-hidden transition-colors ${
                 isLoginLoading 
                   ? "border-titanium-grey text-titanium-grey cursor-not-allowed" 
                   : "border-neon-cyan text-neon-cyan hover:text-void-black"
               }`}
             >
               <div className={`absolute inset-0 bg-neon-cyan transition-transform duration-300 z-0 ${
                 isLoginLoading ? "translate-x-[-100%]" : "translate-x-[-100%] group-hover:translate-x-0"
               }`} />
               <span className="relative z-10 flex items-center gap-2">
                 {isLoginLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-titanium-grey border-t-transparent rounded-full animate-spin" />
                      CONNECTING...
                    </>
                 ) : (
                    <>
                      <Radio size={14} className="animate-pulse" />
                      [ LINK NEURAL INTERFACE ]
                    </>
                 )}
               </span>
             </button>
           ) : (
             <button 
               onClick={handleDisconnect}
               className="group relative px-6 py-2 bg-transparent border border-glitch-red/50 text-glitch-red font-mono text-sm tracking-widest overflow-hidden hover:text-void-black transition-colors"
             >
               <div className="absolute inset-0 bg-glitch-red translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0" />
               <span className="relative z-10 flex items-center gap-2">
                 <Power size={14} />
                 [ TERMINATE LINK ]
               </span>
             </button>
           )}
        </div>

        <div className="space-y-4 font-mono">
          <div>
            <div className="text-xs text-titanium-grey mb-1">STATUS</div>
            <div className={`text-sm ${stats.status === 'ONLINE' ? 'text-matrix-green animate-pulse' : 'text-glitch-red'}`}>
              ● {stats.status} <span className="text-[10px] text-titanium-grey ml-2">via {connectionType}</span>
            </div>
          </div>

          {isConnected && currentUser && (
            <>
              <div>
                <div className="text-xs text-titanium-grey mb-1 flex items-center justify-between">
                  <span>IDENTITY</span>
                </div>
                <div className="flex items-center gap-2">
                   <div 
                     className="relative cursor-pointer group"
                     onMouseEnter={() => setIsHoveringAvatar(true)}
                     onMouseLeave={handleMouseLeave}
                     onClick={handleAvatarClick}
                     title="Click to re-roll avatar"
                   >
                     <CyberAvatar 
                       seed={currentUser.avatarSeed} 
                       size={48} 
                       glitch={isRerolling || (isHoveringAvatar && !hasRerolledInHover)}
                       className="transition-all duration-300 group-hover:border-neon-cyan group-hover:shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                     />
                     {/* Hover Overlay Text */}
                     <div className={`absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] text-neon-cyan font-bold pointer-events-none transition-opacity duration-200 ${isHoveringAvatar && !hasRerolledInHover ? 'opacity-100' : 'opacity-0'}`}>
                       REROLL
                     </div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="text-neon-cyan font-bold text-lg truncate">{currentUser.codename}</div>
                     <div className="text-[10px] text-titanium-grey truncate font-mono">
                        {currentAddress?.slice(0,6)}...{currentAddress?.slice(-4)}
                     </div>
                   </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-titanium-grey mb-1">LEVEL</div>
                <div className="text-neon-cyan">LVL.{stats.level} <span className="text-xs text-titanium-grey">({stats.exp})</span></div>
              </div>

              <div>
                <div className="text-xs text-titanium-grey mb-1 flex justify-between">
                  <span>ENERGY</span>
                  <div className="flex items-center gap-2">
                     <span className="text-neon-cyan font-mono">
                        {showBalance ? energyState.text : '**** SUI'}
                     </span>
                     <button 
                       onClick={toggleBalance}
                       className="text-titanium-grey hover:text-white transition-colors"
                       title={showBalance ? "Hide Balance" : "Show Balance"}
                     >
                       {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                     </button>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => {
                    // Color Logic
                    let barColor = 'bg-neon-cyan shadow-[0_0_5px_#00f3ff]'; // Default
                    if (energyState.level === 'warning') barColor = 'bg-acid-yellow shadow-[0_0_5px_#f0f]';
                    if (energyState.level === 'critical') barColor = 'bg-glitch-red shadow-[0_0_5px_#f00] animate-pulse';

                    return (
                    <div 
                      key={i} 
                      className={`w-full h-3 transition-all duration-500 ${
                        i < stats.energy 
                          ? barColor
                          : 'border border-titanium-grey bg-transparent opacity-30'
                      }`} 
                    />
                  )})}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="flex-1 lg:h-auto min-h-[200px] overflow-hidden flex flex-col">
        <div className="text-titanium-grey border-b border-titanium-grey pb-1 mb-2 text-xs font-mono">SYSTEM LOGS</div>
        <div className="text-xs space-y-1 overflow-y-auto flex-1 font-mono scrollbar-thin">
          <div className="text-matrix-green">&gt; System initialized.</div>
          <div className="text-matrix-green">&gt; Neural link established.</div>
          {isConnected ? (
             currentUser ? (
               <>
                 <div className="text-matrix-green">&gt; Identity verified.</div>
                 <div className="text-neon-cyan">&gt; Welcome back, {currentUser.codename}.</div>
               </>
             ) : (
               <div className="text-acid-yellow animate-pulse">&gt; UNIDENTIFIED SIGNAL.</div>
             )
          ) : (
             <div className="text-titanium-grey animate-pulse">&gt; Waiting for subject connection...</div>
          )}
        </div>
      </Card>
    </aside>
  );
}
