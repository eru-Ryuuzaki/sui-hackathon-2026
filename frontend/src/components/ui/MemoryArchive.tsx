import { format } from 'date-fns';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { CATEGORY_COLORS, type LogTemplateCategory } from '@/data/logTemplates';
import { cn } from '@/utils/cn';
import { Terminal as TerminalIcon, XCircle, List, Search } from 'lucide-react';
import { useState } from 'react';

interface MemoryArchiveProps {
  onExit: () => void;
}

export function MemoryArchive({ onExit }: MemoryArchiveProps) {
  const { logs } = useMemoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-titanium-grey/50 pb-2 shrink-0 mb-4">
        <div className="flex items-center gap-2 text-neon-cyan">
          <List size={14} />
          <span className="font-bold tracking-widest">MEMORY SHARD ARCHIVE</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-titanium-grey hover:text-glitch-red transition-colors">
            <XCircle size={16} />
          </button>
        </div>
      </div>

      {/* Search / Filter Bar */}
      <div className="flex items-center gap-2 bg-white/5 border border-titanium-grey/20 p-2 rounded mb-4 shrink-0">
        <Search size={12} className="text-titanium-grey" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="SEARCH MEMORY FRAGMENTS..."
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-titanium-grey/50 font-mono text-xs"
        />
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-2">
        {filteredLogs.length === 0 ? (
            <div className="text-titanium-grey text-center py-8 text-xs italic border border-titanium-grey/10 rounded p-8">
                &gt; NO MEMORY SHARDS FOUND IN ARCHIVE.
            </div>
        ) : (
            filteredLogs.map((log) => (
                <div key={log.id} className="bg-white/5 border border-titanium-grey/20 p-3 rounded hover:border-neon-cyan/50 transition-colors group relative overflow-hidden">
                    {/* Decorative Scanline */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center justify-between text-[10px] text-titanium-grey mb-2">
                        <span className="text-neon-cyan font-bold font-mono">
                            {format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                        <div className="flex gap-2">
                            <span className={cn(
                                "px-1.5 rounded font-bold tracking-wider",
                                log.type === 'SUCCESS' ? "bg-matrix-green/20 text-matrix-green" :
                                log.type === 'ERROR' ? "bg-glitch-red/20 text-glitch-red" :
                                "bg-titanium-grey/20 text-white"
                            )}>
                                {log.type}
                            </span>
                            <span 
                              className="font-bold tracking-wider"
                              style={{ color: CATEGORY_COLORS[log.category as LogTemplateCategory] || '#fff' }}
                            >
                                [{log.category.toUpperCase()}]
                            </span>
                        </div>
                    </div>
                    
                    <div className="text-xs text-white break-words pl-3 border-l-2 border-titanium-grey/30 group-hover:border-neon-cyan transition-colors py-1 leading-relaxed">
                        {log.content}
                    </div>
                    
                    {log.hash && (
                        <div className="text-[9px] text-titanium-grey/40 mt-2 font-mono text-right flex justify-end items-center gap-1">
                            <span>TX HASH:</span>
                            <span className="text-titanium-grey/60">{log.hash}</span>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
      
      {/* Footer Status */}
      <div className="mt-4 pt-2 border-t border-titanium-grey/30 text-[9px] text-titanium-grey flex justify-between shrink-0">
         <span>TOTAL SHARDS: {filteredLogs.length}</span>
         <span>ARCHIVE STATUS: ONLINE</span>
      </div>
    </div>
  );
}
