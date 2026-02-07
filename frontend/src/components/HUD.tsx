import { Card } from '@/components/ui/Card';
import { ConnectButton } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';

export function HUD() {
  const account = useCurrentAccount();
  const { currentUser } = useUserStore();
  
  // Mock Stats
  const stats = {
    level: account ? (currentUser ? 1 : 0) : 0,
    exp: account ? '0/1000' : '0/0',
    energy: account ? 10 : 0, 
    status: account ? 'ONLINE' : 'OFFLINE'
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
                <div className="text-neon-cyan font-bold text-lg">{currentUser.codename}</div>
                <div className="text-[10px] text-titanium-grey">AVATAR_ID: #{currentUser.avatarId}</div>
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
