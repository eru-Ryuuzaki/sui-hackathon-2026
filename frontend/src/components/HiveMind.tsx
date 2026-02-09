import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Card } from '@/components/ui/Card';
import { HiveMindCalendar } from '@/components/ui/HiveMindCalendar';
import { format } from 'date-fns';

export function HiveMind() {
  const { logs } = useMemoryStore();

  // Convert logs for Calendar
  const calendarLogs = logs.map(log => ({
    id: log.id,
    date: new Date(log.timestamp),
    content: log.content || '',
    type: log.type,
    emotionVal: log.metadata?.energy || 50,
    icon: log.metadata?.mood // Use mood as icon if available
  }));

  return (
    <aside className="lg:col-span-3 flex flex-col h-full min-h-0 space-y-4">
      {/* Top: Calendar (Fixed Height ~40%) */}
      <div className="h-[40%] min-h-[300px]">
        <HiveMindCalendar 
          logs={calendarLogs}
          isOpen={true}
          onClose={() => {}} 
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
             {logs.slice(0, 5).map((log, index) => { // Limit to 5 for absolute safety (No Scroll)
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
                     <div className={subjectClass}>{log.category}</div>
                     <div className={actionClass}>{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                   </div>
                   <div className={textClass}>
                     {log.content}
                   </div>
                   <div className="flex justify-between items-end mt-1">
                      <div className={hashClass}>{log.hash}</div>
                      {log.metadata?.mood && <div className="text-xs opacity-50">{log.metadata.mood}</div>}
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
