import { HUD } from '@/components/HUD';
import { Terminal } from '@/components/Terminal';
import { HiveMind } from '@/components/HiveMind';
import { SystemAlert } from '@/components/ui/SystemAlert';
import { OAuthCallbackHandler } from '@/components/OAuthCallbackHandler';
import { useEffect } from 'react';
import { useLogService } from '@/hooks/useLogService';
import { useMemoryStore } from '@/hooks/useMemoryStore';

function App() {
  const { fetchLogs } = useLogService();
  const { setLogs, logs: currentLogs } = useMemoryStore();

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedLogs = await fetchLogs();
        if (fetchedLogs.length > 0) {
          // Merge strategy: 
          // For now, we just prepend/mix. 
          // If we want to strictly sync, we might want to deduplicate based on ID.
          // Since useMemoryStore is persisted, it might already have them.
          // But "Mock Service" simulates a backend. Backend > Local Cache.
          
          // Simple deduplication by ID
          const existingIds = new Set(currentLogs.map(l => l.id));
          const newLogs = fetchedLogs.filter(l => !existingIds.has(l.id));
          
          if (newLogs.length > 0) {
            setLogs([...newLogs, ...currentLogs]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch initial logs:", e);
      }
    };
    
    loadData();
  }, [fetchLogs]); // Run once on mount (or when service changes)

  return (
    <div className="h-screen bg-void-black text-neon-cyan font-mono p-4 md:p-8 relative overflow-hidden flex flex-col">
      <SystemAlert />
      <OAuthCallbackHandler />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1 min-h-0">
        
        {/* Left Sidebar: HUD */}
        <HUD />

        {/* Center: Main Terminal */}
        <Terminal />

        {/* Right Sidebar: Hive Mind */}
        <HiveMind />

      </div>
    </div>
  )
}

export default App
