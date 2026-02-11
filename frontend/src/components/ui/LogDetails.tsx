import { useState, useEffect } from 'react';
import { useMemoryStore, type MemoryLog } from '@/hooks/useMemoryStore';
import { useGlobalHiveMind } from '@/hooks/useGlobalHiveMind';
import { parseLogTrace } from '@/utils/logHelpers';
import { XCircle, Image as ImageIcon, Paperclip, Lock, Globe, Download, Eye, Unlock, ShieldAlert } from 'lucide-react';
import { CATEGORY_COLORS, type LogTemplateCategory } from '@/data/logTemplates';
import { useSignPersonalMessage } from '@mysten/dapp-kit';
import { deriveKeyFromSignature, decryptText } from '@/utils/encryption';

// Define a type for Metadata that ensures properties exist if metadata itself exists
// or we cast the empty object to a Partial<Metadata>
type LogMetadata = NonNullable<MemoryLog['metadata']>;

// Helper to separate header and body
const splitContent = (content: string) => {
    const parts = content.split('\n\n');
    const header = parts[0];
    const body = parts.length > 1 ? parts.slice(1).join('\n\n') : '';
    return { header, body };
};

export function LogDetails({ onExit }: { onExit: () => void }) {
  const { logs, viewingLogId } = useMemoryStore();
  const { globalLogs } = useGlobalHiveMind();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  
  // State for Decryption
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  // Try finding log in local store first, then global store
  const log = logs.find(l => l.id === viewingLogId) || globalLogs.find(l => l.id === viewingLogId);

  // Reset state when viewingLogId changes
  useEffect(() => {
    setDecryptedContent(null);
    setDecryptionError(null);
    setIsDecrypting(false);
  }, [viewingLogId]);

  if (!log) {
    // If we're viewing a log that suddenly disappears (or during unmount transition), 
    // we should render null or a loading state instead of the error to prevent flashing.
    // However, if it's truly not found (invalid ID), the error is appropriate.
    // Given the "flashing on close" issue, it's likely viewingLogId is cleared (null) in parent,
    // causing this component to re-render with null ID before unmounting?
    // Actually, if viewingLogId is null, parent shouldn't render this component (in Terminal.tsx).
    // BUT if there is an exit animation (Framer Motion), this component stays mounted while viewingLogId might be null or the log is gone.
    // Let's return null if viewingLogId is null to avoid the error flash during exit animation.
    if (!viewingLogId) return null;

    return (
        <div className="h-full flex flex-col items-center justify-center text-titanium-grey">
            <div>LOG_NOT_FOUND_EXCEPTION</div>
            <button onClick={onExit} className="mt-4 text-xs border border-titanium-grey/50 px-2 py-1 rounded hover:text-white">
                RETURN
            </button>
        </div>
    );
  }

  // Cast empty object to Partial<LogMetadata> to allow property access (which will be undefined)
  const metadata = (log.metadata || {}) as Partial<LogMetadata>;

  // --- Decryption Handler ---
  const handleDecrypt = async () => {
      setIsDecrypting(true);
      setDecryptionError(null);

      try {
          // Format expected: "IV_BASE64:CIPHER_BASE64"
          // We need to parse this from the log content.
          // BUT wait, splitContent happens below. The 'header' is usually readable? 
          // NO. If encrypted, the entire 'content' string stored on-chain is "IV:Cipher".
          // So 'header' will be garbage or just the IV part if we split by newline (which might not exist).
          
          // Let's assume the raw log.content is "IV:Cipher"
          const parts = log.content.split(':');
          if (parts.length !== 2) {
             throw new Error("Invalid encrypted format. Data may be corrupted.");
          }
          const [iv, cipherText] = parts;

          // 1. Request Signature
          const msgBytes = new TextEncoder().encode("ENGRAM_ACCESS_KEY_DERIVATION");
          const { signature } = await signPersonalMessage({
             message: msgBytes
          });

          // 2. Derive Key
          const key = await deriveKeyFromSignature(signature);

          // 3. Decrypt
          const plainText = await decryptText(cipherText, iv, key);
          setDecryptedContent(plainText);

      } catch (err: any) {
          console.error("Decryption failed", err);
          setDecryptionError("Decryption failed. Access Denied or Invalid Key.");
      } finally {
          setIsDecrypting(false);
      }
  };

  // Determine what to show
  // If encrypted AND not decrypted yet, show placeholder
  // If decrypted, show decrypted content
  // If not encrypted, show original content
  const contentToShow = decryptedContent || (metadata.isEncrypted ? null : log.content);

  const { header, body } = contentToShow ? splitContent(contentToShow) : { header: '', body: '' };
  
  // Only parse header if we have content
  const parsedHeader = contentToShow ? parseLogTrace(header) : null;
  
  const categoryColor = CATEGORY_COLORS[log.category as LogTemplateCategory] || '#fff';
  
  // Attachment Handler - Safe access
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
             {metadata.isEncrypted && !decryptedContent ? (
                 <div className="flex items-center gap-3 text-glitch-red/80">
                     <Lock size={16} />
                     <span className="font-bold tracking-wider">ENCRYPTED SIGNAL DETECTED</span>
                 </div>
             ) : parsedHeader ? (
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
          
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin text-titanium-grey/90 leading-loose text-sm whitespace-pre-wrap relative">
              {/* Encrypted Overlay */}
              {metadata.isEncrypted && !decryptedContent && (
                  <div className="absolute inset-0 bg-void-black/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                      {decryptionError ? (
                          <div className="text-glitch-red flex flex-col items-center gap-2 mb-4">
                              <ShieldAlert size={32} />
                              <p className="font-bold">{decryptionError}</p>
                          </div>
                      ) : (
                          <Lock size={32} className="text-titanium-grey mb-4 animate-pulse" />
                      )}
                      
                      <p className="text-titanium-grey mb-6 max-w-xs">
                          This memory fragment is encrypted with a neural signature. 
                          Authorization required to decrypt.
                      </p>

                      <button 
                          onClick={handleDecrypt}
                          disabled={isDecrypting}
                          className="flex items-center gap-2 px-6 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-void-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wider uppercase text-xs"
                      >
                          {isDecrypting ? (
                              <>
                                  <span className="animate-spin">⌛</span> DECRYPTING...
                              </>
                          ) : (
                              <>
                                  <Unlock size={14} /> DECRYPT DATA
                              </>
                          )}
                      </button>
                  </div>
              )}

              {/* Content */}
              {metadata.isEncrypted && !decryptedContent ? (
                  // Show garbage text behind overlay
                  <div className="opacity-20 blur-[2px] select-none break-all font-mono text-xs">
                      {Array.from({length: 20}).map(() => 
                          Math.random().toString(36).substring(2) + 
                          Math.random().toString(36).substring(2)
                      ).join(' ')}
                  </div>
              ) : (
                  body || <span className="italic opacity-50 text-xs">No detailed content recorded.</span>
              )}
          </div>
      </div>

      {/* Bottom Hash */}
      <div className="mt-4 text-right">
         <span className="text-[9px] text-titanium-grey/40 font-mono">TX_HASH: {log.hash}</span>
      </div>
    </div>
  );
}
