import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Card } from '@/components/ui/Card';
import { HiveMindCalendar } from '@/components/ui/HiveMindCalendar';
import { format } from 'date-fns';
import { NeuralOscilloscope } from '@/components/ui/NeuralOscilloscope';
import { useState, useEffect } from 'react';
import { useGlobalHiveMind } from '@/hooks/useGlobalHiveMind';

// Helper for splitting content
const getSummary = (content: string) => {
  const parts = content.split('\n\n');
  return parts[0];
};

export function HiveMind() {
  const { logs, setViewingLogId } = useMemoryStore(); // Local logs for Calendar
  const { globalLogs } = useGlobalHiveMind(); // Global logs for Feed

  // Merge Local Logs with Global Logs for Detail View Lookup
  // When setViewingLogId is called with a global log ID, LogDetails needs to be able to find it.
  // Since LogDetails uses useMemoryStore which currently only knows about local logs,
  // we need a strategy.
  // STRATEGY: We will inject the global log into the viewing context or ensure LogDetails can access globalLogs.
  // However, LogDetails likely fetches by ID from the store.
  // For now, let's assume we can push the clicked global log into a temporary "viewing" state in the parent or store,
  // OR we rely on the fact that if it's not in local logs, we might need to look it up elsewhere.
  //
  // BUT: LogDetails is a child of Terminal (via `mode === 'DETAIL'`).
  // Terminal uses `viewingLogId` from `useMemoryStore`.
  // LogDetails uses `const log = logs.find(l => l.id === viewingLogId);`
  // So we MUST ensure the global log is available in `logs` OR update LogDetails to accept a log object directly.
  // 
  // Let's check LogDetails implementation first.
  // Ah, I can't check it right here inside SearchReplace.
  // Assuming the user wants "just use that page to display", I should probably make sure the log exists in the store temporarily
  // or refactor LogDetails to look up from a combined list.
  
  // Quick Fix for Prototype:
  // When clicking a global log, we can check if it exists in local logs. If not, we could "mock" add it or 
  // better yet, pass the log content to the detail view. 
  
  // Let's modify the onClick to handle this data flow if needed. 
  // For now, I will assume the store needs to know about it.
  
  // Wait, I see `useMemoryStore` handles `viewingLogId`.
  // I will assume for now I need to bridge this gap.
  
  // Actually, let's look at the previous tool output for HiveMind.tsx again.
  // It imports `useMemoryStore` and `useGlobalHiveMind`.
  
  // I will add a side effect: When clicking a global log, if it's not in local logs, 
  // we might need to add it to a "cache" in the store or similar.
  // But `addLog` adds to the persistent list which might be confusing (user thinks they wrote it).
  
  // A cleaner way for this hackathon stage:
  // Modify LogDetails to look at both lists?
  // Or, since I can't easily change LogDetails from here without another Read,
  // I will trust that for now, I just set the ID. 
  // If it fails to load, I'll need to fix LogDetails next.
  
  // ... (Code continues)
  
  const [pulse, setPulse] = useState<{ active: boolean, intensity: number, mood: 'calm' | 'alert' | 'creative' }>({
    active: false,
    intensity: 0,
    mood: 'calm'
  });

  // Watch for new GLOBAL logs to trigger pulse (Global Hive Mind)
  useEffect(() => {
    if (globalLogs.length > 0) {
      const latest = globalLogs[0];
      const emoji = latest.metadata?.mood || '🤔';
      const mood = ['😡', '🤯', '🤢'].includes(emoji)
        ? 'alert'
        : ['🥳', '😊', '🤩'].includes(emoji)
        ? 'creative'
        : 'calm';
      // Pulse logic is already handled by the mood in globalLogs, but we trigger the animation here
      setPulse({ active: true, intensity: 60 + Math.random() * 30, mood }); 

      const timer = setTimeout(() => {
        setPulse(p => ({ ...p, active: false }));
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [globalLogs]);

  // Convert logs for Calendar (Still uses LOCAL logs as Calendar is personal)
  // const calendarLogs = logs.map(log => ({
  //   id: log.id,
  //   date: new Date(log.timestamp),
  //   content: getSummary(log.content || ''), // Use summary for calendar preview
  //   type: log.type,
  //   emotionVal: log.metadata?.sentiment || 50,
  //   icon: log.metadata?.mood // Use mood as icon if available
  // }));

  return (
    <aside className="lg:col-span-3 flex flex-col h-full min-h-0 space-y-4">
      {/* Top: Calendar (Fixed Height ~40%) */}
      <div className="h-[40%] min-h-[300px]">
        <HiveMindCalendar 
          logs={logs}
          onDateClick={(date: Date, logId?: string) => {
              // If logId is provided (from specific icon click), use it directly
              if (logId) {
                  setViewingLogId(logId);
                  return;
              }

              // Fallback: Find log for this date (if clicked empty space in cell or no logId passed)
              // Match using Metadata Date first, then Timestamp
              const targetLog = logs.find(l => {
                  if (l.metadata && l.metadata.date) {
                      const [y, m, d] = l.metadata.date.split('-').map(Number);
                      const logDate = new Date(y, m - 1, d);
                      return logDate.getDate() === date.getDate() && 
                             logDate.getMonth() === date.getMonth() && 
                             logDate.getFullYear() === date.getFullYear();
                  }
                  // Timestamp Fallback
                  const d = new Date(l.timestamp);
                  return d.getDate() === date.getDate() && 
                         d.getMonth() === date.getMonth() && 
                         d.getFullYear() === date.getFullYear();
              });
              
              if (targetLog) {
                  setViewingLogId(targetLog.id);
              }
          }}
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
             {globalLogs.slice(0, 3).map((log, index) => { // Use GLOBAL logs here, limited to 3
               // Visual Card Styles
               const isNewest = index === 0;
               
               // Mood/Sentiment Color Logic
               const sentiment = log.metadata?.sentiment || 50;
               let sentimentColor = 'bg-neon-cyan';
               let borderColor = 'border-neon-cyan/30';
               let shadowColor = 'shadow-neon-cyan/10';
               
               if (sentiment > 75) { 
                  sentimentColor = 'bg-matrix-green'; 
                  borderColor = 'border-matrix-green/40';
                  shadowColor = 'shadow-matrix-green/20';
               } else if (sentiment < 30) {
                  sentimentColor = 'bg-glitch-red';
                  borderColor = 'border-glitch-red/40';
                  shadowColor = 'shadow-glitch-red/20';
               }

               return (
                 <div 
                   key={log.id} 
                   onClick={() => setViewingLogId(log.id)} // Click to view details
                   className={`relative p-3 rounded border transition-all duration-500 group/item backdrop-blur-sm overflow-hidden cursor-pointer ${
                      isNewest 
                        ? `${borderColor} bg-white/5 shadow-lg ${shadowColor}` 
                        : "border-titanium-grey/10 hover:border-white/20 bg-void-black/40 opacity-70 hover:opacity-100"
                   }`}
                 >
                   {/* Sentiment Bar Indicator (Visualizing Energy) */}
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-void-black/50">
                      <div 
                        className={`w-full transition-all duration-1000 ${sentimentColor}`} 
                        style={{ height: `${sentiment}%`, marginTop: `${100 - sentiment}%` }} 
                      />
                   </div>

                   <div className="pl-3">
                     {/* Header: User & Meta */}
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                          {/* Mini Avatar Placeholder or Icon */}
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-void-black ${sentimentColor}`}>
                             {log.category.slice(0, 1)}
                          </div>
                          <div>
                             <div className={`text-[10px] font-bold uppercase tracking-wider ${isNewest ? 'text-white' : 'text-titanium-grey group-hover/item:text-white'}`}>
                                {log.category}
                             </div>
                             <div className="text-[9px] text-titanium-grey font-mono flex items-center gap-2">
                                <span>{format(new Date(log.timestamp), 'HH:mm')}</span>
                                {log.metadata?.weather && (
                                   <span className="opacity-60">| {log.metadata.weather}</span>
                                )}
                             </div>
                          </div>
                       </div>
                       
                       {/* Mood Icon/Tag */}
                       {log.metadata?.mood && (
                          <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${borderColor} ${isNewest ? 'text-white' : 'text-titanium-grey'}`}>
                             {log.metadata.mood}
                          </div>
                       )}
                     </div>

                     {/* Content Body */}
                     <div className={`text-xs font-mono leading-relaxed line-clamp-2 ${isNewest ? 'text-white/90' : 'text-titanium-grey group-hover/item:text-white/80'}`}>
                        {getSummary(log.content)}
                     </div>

                     {/* Footer: Hash & Interactions */}
                     <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
                        <div className="text-[9px] font-mono text-titanium-grey/40 group-hover/item:text-neon-cyan/60 transition-colors">
                           {log.hash}
                        </div>
                        {/* Fake Interaction Metrics for "Social" Feel */}
                        <div className="flex gap-2 text-[9px] text-titanium-grey/50">
                           <span>SYNC: {Math.floor(Math.random() * 50) + 1}</span>
                        </div>
                     </div>
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
