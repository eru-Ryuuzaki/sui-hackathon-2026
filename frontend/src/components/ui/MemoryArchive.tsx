import { format } from 'date-fns';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { CATEGORY_COLORS, type LogTemplateCategory } from '@/data/logTemplates';
import { cn } from '@/utils/cn';
import { XCircle, List, Search, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';
import { useState } from 'react';

// NEW: Helper to split content
const getSummary = (content: string) => {
  // If we have double newline, split and take first part.
  // Or just take the first line if no double newline.
  const parts = content.split('\n\n');
  if (parts.length > 1) return parts[0];
  
  // Fallback: first line
  return content.split('\n')[0];
};

interface MemoryArchiveProps {
  onExit: () => void;
}

export function MemoryArchive({ onExit }: MemoryArchiveProps) {
  const { logs, setViewingLogId } = useMemoryStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort logs by Date (Metadata > Timestamp)
  const sortedLogs = logs.sort((a, b) => {
    // Helper to get date object from log
    const getDate = (log: typeof a) => {
        if (log.metadata && log.metadata.date) {
            const [y, m, d] = log.metadata.date.split('-').map(Number);
            // Include time if available for precise sorting
            if (log.metadata.time) {
                const [h, min] = log.metadata.time.split(':').map(Number);
                return new Date(y, m - 1, d, h, min).getTime();
            }
            return new Date(y, m - 1, d).getTime();
        }
        return log.timestamp;
    };
    return getDate(b) - getDate(a); // Descending order (Newest first)
  });

  // Filter logs based on search term
  const filteredLogs = sortedLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    const content = log.content || '';
    const category = log.category || '';
    const type = log.type || '';
    
    return content.toLowerCase().includes(term) ||
           category.toLowerCase().includes(term) ||
           type.toLowerCase().includes(term);
  });

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
                <div 
                    key={log.id} 
                    onClick={() => setViewingLogId(log.id)}
                    className="bg-white/5 border border-titanium-grey/20 p-3 rounded hover:border-neon-cyan/50 transition-colors group relative overflow-hidden cursor-pointer"
                >
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
                        {getSummary(log.content)}
                    </div>

                    {/* Attachment Icons based on Media Type */}
                    {log.metadata?.attachments && log.metadata.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pl-3">
                            {log.metadata.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px] text-titanium-grey bg-white/5 px-2 py-1 rounded border border-titanium-grey/20 hover:border-neon-cyan/50 hover:text-white transition-colors cursor-help" title={`${att.name} (${att.type})`}>
                                    {att.type.startsWith('image/') ? (
                                        <ImageIcon size={12} className="text-neon-cyan" />
                                    ) : att.type.includes('pdf') || att.type.includes('text') ? (
                                        <FileText size={12} className="text-neon-purple" />
                                    ) : (
                                        <Paperclip size={12} />
                                    )}
                                    <span className="truncate max-w-[120px] font-mono">{att.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
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
