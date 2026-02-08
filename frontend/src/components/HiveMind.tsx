import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { HiveMindCalendar } from '@/components/ui/HiveMindCalendar';
import { format } from 'date-fns';

// Mock Data (replace with real data later)
const MOCK_LOGS = Array.from({ length: 50 }).map((_, i) => ({
  id: i.toString(),
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 5), // Spread over time
  content: i % 3 === 0 ? `[SYSTEM] Memory shard #${i} engraved.` : `User note: Today was a good day #${i}`,
  icon: i % 3 === 0 ? '💾' : i % 5 === 0 ? '🌟' : undefined,
  emotionVal: 50 + (i % 50),
  hash: `0x${Math.random().toString(16).slice(2, 10)}...`
}));

export function HiveMind() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(true); // Always true or remove state

  return (
    <aside className="lg:col-span-3 flex flex-col h-full min-h-0 space-y-4">
      {/* Top: Calendar (Fixed Height ~40%) */}
      <div className="h-[40%] min-h-[300px]">
        <HiveMindCalendar 
          logs={MOCK_LOGS}
          isOpen={true}
          onClose={() => {}} // No close needed
          onDateClick={(date) => console.log('Clicked date:', date)}
        />
      </div>

      {/* Bottom: Feed (Remaining Height) */}
      <Card className="flex-1 flex flex-col overflow-hidden relative min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm font-bold text-titanium-grey tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" />
              HIVE MIND FEED
            </h2>
          </div>
          
          <div className="space-y-3 overflow-hidden flex-1 min-h-0 mask-image-gradient-b">
             {MOCK_LOGS.slice(0, 5).map((log, index) => { // Limit to 5 for absolute safety (No Scroll)
               let containerClass = "p-3 border-l-2 transition-all duration-300 group/item backdrop-blur-sm ";
               let textClass = "text-xs font-mono transition-colors ";
               let subjectClass = "font-bold text-[10px] mb-1 transition-colors ";
               let actionClass = "text-[10px] transition-colors ";
               let hashClass = "text-[9px] font-mono mt-1 transition-colors ";

               if (index === 0) { 
                  // NEWEST: Glowing, Bright, Highlighted Border
                  containerClass += " border-matrix-green bg-matrix-green/10 shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]";
                  textClass += " text-matrix-green drop-shadow-[0_0_2px_rgba(0,255,65,0.8)]";
                  subjectClass += " text-white drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]";
                  actionClass += " text-matrix-green/90";
                  hashClass += " text-matrix-green/70";
               } else if (index < 4) { 
                  // ACTIVE ZONE (Next 3): Standard Green, Solid Border
                  containerClass += " border-matrix-green/30 hover:bg-white/5 hover:border-matrix-green/60";
                  textClass += " text-matrix-green/80";
                  subjectClass += " text-matrix-green group-hover/item:text-neon-cyan";
                  actionClass += " text-titanium-grey group-hover/item:text-titanium-grey/80";
                  hashClass += " text-titanium-grey/50";
               } else {
                  // FADING ZONE (Last 1): Fading out, No Border
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
                      // Optimized Fade for 5 items: Only the last one fades
                      opacity: index === 4 ? 0.3 : 1
                   }}
                 >
                   <div className="flex justify-between items-start">
                     <div className={subjectClass}>SUBJECT_#{log.id.padStart(4, '0')}</div>
                     <div className={actionClass}>{format(log.date, 'HH:mm:ss')}</div>
                   </div>
                   <div className={textClass}>
                     {log.content}
                   </div>
                   <div className="flex justify-between items-end mt-1">
                      <div className={hashClass}>{log.hash}</div>
                      {log.icon && <div className="text-xs opacity-50">{log.icon}</div>}
                   </div>
                 </div>
               );
             })}
          </div>

          {/* Bottom Fade Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-void-black to-transparent pointer-events-none" />
      </Card>
    </aside>
  );
}
