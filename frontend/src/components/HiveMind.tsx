import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Card } from '@/components/ui/Card';
import { HiveMindCalendar } from '@/components/ui/HiveMindCalendar';
import { format } from 'date-fns';
import { NeuralOscilloscope } from '@/components/ui/NeuralOscilloscope';
import { useState, useEffect } from 'react';
import { useGlobalHiveMind } from '@/hooks/useGlobalHiveMind';

export function HiveMind() {
  const { logs } = useMemoryStore(); // Local logs for Calendar
  const { globalLogs } = useGlobalHiveMind(); // Global logs for Feed
  
  const [pulse, setPulse] = useState<{ active: boolean, intensity: number, mood: 'calm' | 'alert' | 'creative' }>({
    active: false,
    intensity: 0,
    mood: 'calm'
  });

  // Watch for new GLOBAL logs to trigger pulse (Global Hive Mind)
  useEffect(() => {
    if (globalLogs.length > 0) {
      const latest = globalLogs[0];
      // Pulse logic is already handled by the mood in globalLogs, but we trigger the animation here
      setPulse({ active: true, intensity: 60 + Math.random() * 30, mood: latest.mood }); 

      const timer = setTimeout(() => {
        setPulse(p => ({ ...p, active: false }));
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [globalLogs]);

  // Convert logs for Calendar (Still uses LOCAL logs as Calendar is personal)
  const calendarLogs = logs.map(log => ({
    id: log.id,
    date: new Date(log.timestamp),
    content: log.content || '',
    type: log.type,
    emotionVal: log.metadata?.sentiment || 50,
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
      <Card className="flex-1 flex flex-col overflow-hidden relative min-h-0 p-0">
          {/* Header with Pulse */}
          <div className="shrink-0 relative">
             <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
                <h2 className="text-sm font-bold text-titanium-grey tracking-widest flex items-center gap-2 bg-void-black/80 px-2 py-1 rounded backdrop-blur-sm border border-titanium-grey/20">
                  <span className="w-2 h-2 bg-matrix-green rounded-full animate-pulse" />
                  HIVE MIND FEED
                </h2>
             </div>
             <NeuralOscilloscope 
                isActive={pulse.active} 
                intensity={pulse.intensity} 
                mood={pulse.mood} 
             />
          </div>
          
          <div className="space-y-3 overflow-hidden flex-1 min-h-0 mask-image-gradient-b p-3 pt-2">
             {globalLogs.slice(0, 3).map((log, index) => { // Use GLOBAL logs here
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
               } else { 
                  // NORMAL (Next 2): Reduced brightness, Context only
                  containerClass += " border-titanium-grey/20 hover:bg-white/5 hover:border-titanium-grey/40";
                  textClass += " text-titanium-grey/80";
                  subjectClass += " text-titanium-grey group-hover/item:text-neon-cyan";
                  actionClass += " text-titanium-grey/60";
                  hashClass += " text-titanium-grey/30";
               }

               return (
                 <div 
                   key={log.id} 
                   className={containerClass}
                   style={{
                      opacity: index === 0 ? 1 : 0.6 // Dim older items significantly
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
                      {/* Global logs might not have attachments viewer for now to keep it lightweight */}
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
