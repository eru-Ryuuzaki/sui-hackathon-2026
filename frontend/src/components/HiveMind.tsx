import { Card } from '@/components/ui/Card';
import { useMockHiveMind } from '@/hooks/useMockData';
import { useState } from 'react';

export function HiveMind() {
  const [isPaused, setIsPaused] = useState(false);
  const logs = useMockHiveMind(isPaused);

  return (
    <aside className="lg:col-span-3 h-full hidden lg:block min-h-0">
      <Card 
        className="h-full flex flex-col overflow-hidden relative group/card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="text-xs text-titanium-grey border-b border-titanium-grey pb-2 mb-4 font-mono shrink-0 flex justify-between items-center">
          <span>HIVE MIND ACTIVITY</span>
          <span className={`text-[10px] transition-colors ${isPaused ? 'text-acid-yellow' : 'text-matrix-green animate-pulse'}`}>
            {isPaused ? '❚❚ PAUSED' : '● LIVE'}
          </span>
        </div>
        
        <div className="space-y-4 text-xs opacity-80 flex-1 pr-2 relative z-10">
           {logs.map((log, index) => {
             // Design: Monochrome Luminance + Timeline Indicator
             
             // Base classes
             let containerClass = "font-mono pl-3 transition-all duration-300 p-1.5 group/item relative border-l-2";
             let textClass = "transition-colors duration-300";
             let subjectClass = "font-bold transition-colors duration-300 mb-0.5";
             let actionClass = "text-[10px] transition-colors duration-300";
             let hashClass = "text-[10px] font-mono tracking-tighter transition-colors duration-300";

             // State-based Styling
             if (index === 0) { 
                // NEWEST: Glowing, Bright, Highlighted Border
                containerClass += " border-matrix-green bg-matrix-green/10 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]";
                textClass += " text-matrix-green drop-shadow-[0_0_2px_rgba(0,255,65,0.8)]";
                subjectClass += " text-white drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]";
                actionClass += " text-matrix-green/90";
                hashClass += " text-matrix-green/70";
             } else if (index < 8) { 
                // ACTIVE ZONE (Expanded from 5 to 8): Standard Green, Solid Border
                containerClass += " border-matrix-green/30 hover:bg-white/5 hover:border-matrix-green/60";
                textClass += " text-matrix-green/80";
                subjectClass += " text-matrix-green group-hover/item:text-neon-cyan";
                actionClass += " text-titanium-grey group-hover/item:text-titanium-grey/80";
                hashClass += " text-titanium-grey/50";
             } else {
                // FADING ZONE (Only last 4 items): Fading out, No Border
                containerClass += " border-transparent hover:bg-white/5";
                textClass += " text-titanium-grey";
                subjectClass += " text-titanium-grey/70 group-hover/item:text-titanium-grey";
                actionClass += " text-titanium-grey/40";
                hashClass += " text-titanium-grey/20";
             }

             return (
               <div 
                 key={log.id} 
                 className={containerClass}
                 style={{
                    // Optimized S-Curve Fade: Start fading later (index 7), higher min opacity (0.4)
                    opacity: index >= 7 ? Math.max(0.4, 1 - (index - 7) * 0.15) : 1
                 }}
               >
                 {/* Glowing indicator line for the newest item */}
                 {index === 0 && (
                    <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-matrix-green shadow-[0_0_8px_#00ff41]" />
                 )}

                 <div className="flex justify-between items-center mb-1">
                   <span className={textClass}>
                     {log.timestamp.toLocaleTimeString()}
                   </span>
                   <span className={hashClass}>{log.hash.slice(0, 6)}</span>
                 </div>
                 <div className={subjectClass}>
                   {log.subject}
                 </div>
                 <div className={actionClass}>{log.action}</div>
               </div>
             );
           })}
        </div>
      </Card>
    </aside>
  );
}
