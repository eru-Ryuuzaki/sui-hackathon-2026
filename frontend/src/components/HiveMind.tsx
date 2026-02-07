import { Card } from '@/components/ui/Card';
import { useMockHiveMind } from '@/hooks/useMockData';

export function HiveMind() {
  const logs = useMockHiveMind();

  return (
    <aside className="lg:col-span-3 h-full hidden lg:block">
      <Card className="h-full flex flex-col">
        <div className="text-xs text-titanium-grey border-b border-titanium-grey pb-2 mb-4 font-mono">HIVE MIND ACTIVITY</div>
        <div className="space-y-4 text-xs opacity-80 overflow-y-auto flex-1 scrollbar-thin">
           {logs.map((log) => (
             <div key={log.id} className="font-mono border-l-2 border-titanium-grey pl-2 hover:border-matrix-green transition-colors group">
               <div className="text-titanium-grey text-[10px]">{log.timestamp.toLocaleTimeString()}</div>
               <div className="text-matrix-green group-hover:text-neon-cyan transition-colors">{log.subject}</div>
               <div className="text-gray-400">{log.action}</div>
               <div className="text-[10px] text-titanium-grey/50 truncate">{log.hash}</div>
             </div>
           ))}
        </div>
      </Card>
    </aside>
  );
}
