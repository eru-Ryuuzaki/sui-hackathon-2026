import { useMemoryStore } from '@/hooks/useMemoryStore';
import { parseLogTrace } from '@/utils/logHelpers';
import { XCircle, Image as ImageIcon, Paperclip, Lock, Globe, Download, Eye } from 'lucide-react';
import { CATEGORY_COLORS, type LogTemplateCategory } from '@/data/logTemplates';// Helper to separate header and body
const splitContent = (content: string) => {
    const parts = content.split('\n\n');
    const header = parts[0];
    const body = parts.length > 1 ? parts.slice(1).join('\n\n') : '';
    return { header, body };
};

export function LogDetails({ onExit }: { onExit: () => void }) {
  const { logs, viewingLogId } = useMemoryStore();
  
  const log = logs.find(l => l.id === viewingLogId);
  
  if (!log) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-titanium-grey">
            <div>LOG_NOT_FOUND_EXCEPTION</div>
            <button onClick={onExit} className="mt-4 text-xs border border-titanium-grey/50 px-2 py-1 rounded hover:text-white">
                RETURN
            </button>
        </div>
    );
  }

  const { header, body } = splitContent(log.content);
  const parsedHeader = parseLogTrace(header);
  const categoryColor = CATEGORY_COLORS[log.category as LogTemplateCategory] || '#fff';
  const metadata = log.metadata || {};

  // Attachment Handler
  const primaryAttachment = metadata.attachments && metadata.attachments.length > 0 ? metadata.attachments[0] : null;
  const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space/v1";

  const handleAttachmentClick = (blobId: string) => {
      const url = `${WALRUS_AGGREGATOR}/${blobId}`;
      window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden font-mono text-xs relative">
      {/* Top Bar: Title & Close */}
      <div className="flex justify-between items-start mb-6 shrink-0">
          <div>
              <h2 className="text-xl font-bold text-white tracking-widest mb-1">Log Details</h2>
              <div className="flex items-center gap-4 text-[10px] text-titanium-grey/60">
                  <span className="font-mono">ID: {log.id}</span>
                  <span className="w-px h-3 bg-titanium-grey/30" />
                  <span className="uppercase tracking-wider">CATEGORY: {log.category}</span>
              </div>
          </div>
          <button 
            onClick={onExit}
            className="text-titanium-grey hover:text-glitch-red transition-colors p-1"
          >
            <XCircle size={20} />
          </button>
      </div>

      {/* 1. Core Trace (Header) */}
      <div className="border border-neon-cyan/30 bg-neon-cyan/5 p-4 rounded mb-6 shrink-0 relative overflow-hidden group">
          {/* Decorative Glitch Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan/50" />
          
          <div className="font-mono text-sm leading-relaxed break-words">
             {parsedHeader ? (
                 <>
                    <span className="text-neon-cyan font-bold">{parsedHeader.time}</span>
                    {/* Frame would go here if we had it */}
                    {/* <span className="text-matrix-green font-bold">[Frame {metadata.lifeFrame || '000'}]</span> */}
                    <span style={{ color: categoryColor }} className="font-bold">{parsedHeader.category}</span>
                    <span className="text-yellow-400 font-bold">{parsedHeader.type}: </span>
                    <span className="text-white">{parsedHeader.message}</span>
                 </>
             ) : (
                 <span className="text-white">{header}</span>
             )}
          </div>
      </div>

      {/* 2. Vitals (Middle Bar) */}
      <div className="flex items-center justify-between bg-void-black border border-titanium-grey/20 p-3 rounded mb-6 shrink-0">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-titanium-grey font-bold tracking-wider">WEATHER:</span>
                  <span className="text-lg">{metadata.weather || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-titanium-grey font-bold tracking-wider">MOOD:</span>
                  <span className="text-lg">{metadata.mood || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                   <span className="text-[10px] text-titanium-grey font-bold tracking-wider">PRIVACY:</span>
                   {metadata.isEncrypted ? (
                       <Lock size={12} className="text-matrix-green" />
                   ) : (
                       <Globe size={12} className="text-neon-cyan" />
                   )}
              </div>
          </div>

          <div className="flex items-center gap-3 w-1/3 justify-end">
            {primaryAttachment ? (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-titanium-grey font-bold tracking-wider">ATTACHMENT</span>
                    <div className="flex items-center gap-1 bg-white/5 border border-titanium-grey/30 rounded px-2 py-1">
                        {primaryAttachment.type.startsWith('image/') ? (
                             <ImageIcon size={12} className="text-neon-cyan" />
                        ) : (
                             <Paperclip size={12} className="text-titanium-grey" />
                        )}
                        <span className="text-[10px] text-white font-mono truncate max-w-[80px]">
                            {primaryAttachment.name}
                        </span>
                        
                        {/* Action Button */}
                        <div className="w-px h-3 bg-titanium-grey/30 mx-1" />
                        <button 
                            onClick={() => handleAttachmentClick(primaryAttachment.blobId)}
                            className="text-titanium-grey hover:text-white transition-colors"
                            title={primaryAttachment.type.startsWith('image/') ? "Preview" : "Download"}
                        >
                            {primaryAttachment.type.startsWith('image/') ? (
                                <Eye size={12} />
                            ) : (
                                <Download size={12} />
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 opacity-50">
                    <span className="text-[10px] text-titanium-grey font-bold tracking-wider">ATTACHMENT</span>
                    <span className="text-[10px] text-titanium-grey italic">NONE</span>
                </div>
            )}
          </div>
      </div>

      {/* 3. Detailed Log (Body) */}
      <div className="flex-1 flex flex-col min-h-0 border border-titanium-grey/20 rounded bg-white/5 relative">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-titanium-grey/10 text-[10px] text-neon-cyan font-bold tracking-widest shrink-0">
              <div className="w-2 h-2 rounded-full bg-neon-cyan" />
              DETAILED LOG
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin text-titanium-grey/90 leading-loose text-sm whitespace-pre-wrap">
              {body || <span className="italic opacity-50 text-xs">No detailed content recorded.</span>}
          </div>
          
          {/* REMOVED OLD BOTTOM ATTACHMENT SECTION */}
      </div>

      {/* Bottom Hash */}
      <div className="mt-4 text-right">
         <span className="text-[9px] text-titanium-grey/40 font-mono">TX_HASH: {log.hash}</span>
      </div>
    </div>
  );
}
