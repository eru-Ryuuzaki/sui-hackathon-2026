import { Card } from '@/components/ui/Card';
import { ConnectButton } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { CyberAvatar } from '@/components/ui/CyberAvatar';
import { useState } from 'react';

export function HUD() {
  const account = useCurrentAccount();
  const { currentUser, updateAvatar } = useUserStore();
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);
  
  // Mock Stats
  const stats = {
    level: account ? (currentUser ? 1 : 0) : 0,
    exp: account ? '0/1000' : '0/0',
    energy: account ? 10 : 0, 
    status: account ? 'ONLINE' : 'OFFLINE'
  };

  const handleAvatarClick = () => {
    if (!account || !currentUser || isRerolling) return;
    
    setIsRerolling(true);
    
    // Play glitch animation for 300ms then update
    setTimeout(() => {
       const newSeed = Math.random().toString(36).substring(7);
       updateAvatar(account.address, newSeed);
       setIsRerolling(false);
    }, 300);
  };

  return (
    <aside className="lg:col-span-3 space-y-6 flex flex-col h-full min-h-0">
      <Card className="shrink-0">
        <h1 className="text-3xl font-bold mb-2 font-heading tracking-widest text-white drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]">ENGRAM</h1>
        <div className="text-xs text-titanium-grey mb-4">Ver 1.0.0 (MVP)</div>
        
        <div className="flex justify-center mb-6">
           <ConnectButton className="!bg-transparent !text-neon-cyan !border !border-neon-cyan !font-mono !rounded-none hover:!bg-neon-cyan hover:!text-void-black transition-colors" />
        </div>

        <div className="space-y-4 font-mono">
          <div>
            <div className="text-xs text-titanium-grey mb-1">STATUS</div>
            <div className={`text-sm ${stats.status === 'ONLINE' ? 'text-matrix-green animate-pulse' : 'text-glitch-red'}`}>
              ● {stats.status}
            </div>
          </div>

          {account && currentUser && (
            <>
              <div>
                <div className="text-xs text-titanium-grey mb-1">IDENTITY</div>
                <div className="flex items-center gap-2">
                   <div 
                     className="relative cursor-pointer group"
                     onMouseEnter={() => setIsHoveringAvatar(true)}
                     onMouseLeave={() => setIsHoveringAvatar(false)}
                     onClick={handleAvatarClick}
                     title="Click to re-roll avatar"
                   >
                     <CyberAvatar 
                       seed={currentUser.avatarSeed} 
                       size={48} 
                       glitch={isRerolling || isHoveringAvatar}
                       className="transition-all duration-300 group-hover:border-neon-cyan group-hover:shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                     />
                     {/* Hover Overlay Text */}
                     <div className={`absolute inset-0 flex items-center justify-center bg-black/60 text-[8px] text-neon-cyan font-bold pointer-events-none transition-opacity duration-200 ${isHoveringAvatar ? 'opacity-100' : 'opacity-0'}`}>
                       REROLL
                     </div>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <div className="text-neon-cyan font-bold text-lg truncate">{currentUser.codename}</div>
                     <div className="text-[10px] text-titanium-grey truncate font-mono">
                        {account.address.slice(0,6)}...{account.address.slice(-4)}
                     </div>
                   </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-titanium-grey mb-1">LEVEL</div>
                <div className="text-neon-cyan">LVL.{stats.level} <span className="text-xs text-titanium-grey">({stats.exp})</span></div>
              </div>

              <div>
                <div className="text-xs text-titanium-grey mb-1">ENERGY</div>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-full h-3 transition-all duration-500 ${
                        i < stats.energy 
                          ? 'bg-neon-cyan shadow-[0_0_5px_#00f3ff]' 
                          : 'border border-titanium-grey bg-transparent opacity-30'
                      }`} 
                    />
                  ))}
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
          {account ? (
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
