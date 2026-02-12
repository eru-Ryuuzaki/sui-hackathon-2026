import { useState, useRef } from 'react';
import { useSignPersonalMessage } from '@mysten/dapp-kit';
import { WalrusService } from '@/services/walrus';
import { deriveKeyFromSignature, encryptFile, arrayBufferToBase64 } from '@/utils/encryption';
import { useEncryptionStore } from '@/hooks/useEncryptionStore';
import { Upload, File as FileIcon, X, Lock, Loader2 } from 'lucide-react';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { cn } from '@/utils/cn';
import { useGlobalLoader } from '@/components/ui/GlobalLoader';

export interface Attachment {
  id: string;
  file: File;
  previewUrl: string;
  blobId?: string;
  encryptionIv?: string; // Base64 IV if encrypted
  isEncrypted: boolean;
  type: 'image' | 'document' | 'other';
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
}

interface AttachmentUploaderProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  isEncryptedGlobal: boolean; // Add global prop
}

import { GlitchModal } from '@/components/ui/GlitchModal';
import { Activity, Check } from 'lucide-react';

export function AttachmentUploader({ attachments, onAttachmentsChange, isEncryptedGlobal }: AttachmentUploaderProps) {
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const { sessionKey, setSessionKey } = useEncryptionStore();
  const loader = useGlobalLoader();
  
  // Warning State for Upload
  // const [showUploadWarning, setShowUploadWarning] = useState(() => {
  //   return localStorage.getItem('ENGRAM_UPLOAD_WARNING') !== 'false';
  // });
  // const [showUploadWarning, setShowUploadWarning] = useState(false); // Disabled for MVP
  const [isUploadWarningOpen, setIsUploadWarningOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // Default Epochs = 1
  const [selectedEpochs, setSelectedEpochs] = useState<number>(1);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEncryptionKey = async () => {
    if (sessionKey) return sessionKey;
    
    try {
      loader.show("AWAITING SECURITY SIGNATURE...");
      // Request Signature to derive key
      // Message to sign: "ENGRAM_ACCESS_KEY_DERIVATION"
      const msgBytes = new TextEncoder().encode("ENGRAM_ACCESS_KEY_DERIVATION");
      
      triggerAlert({ type: 'info', title: 'SECURITY CHECK', message: 'Please sign to derive your encryption key.', duration: 5000 });
      
      const signatureResult = await signMessage({
        message: msgBytes,
      });

      const signature = signatureResult.signature;
      const key = await deriveKeyFromSignature(signature);
      setSessionKey(key);
      return key;
    } catch (error) {
      console.error("Key Derivation Failed:", error);
      triggerAlert({ type: 'error', title: 'ACCESS DENIED', message: 'Failed to derive encryption key.' });
      throw error;
    } finally {
      loader.hide();
    }
  };

  const [showMvpWarning, setShowMvpWarning] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // MVP Restriction: Block uploads for now
    setShowMvpWarning(true);
    return;

    /* 
    // Original Upload Logic (Disabled for MVP)
    if (showUploadWarning) {
        setPendingFiles(files);
        setIsUploadWarningOpen(true);
    } else {
        processFiles(files);
    }
    */
  };

  const confirmUpload = () => {
    if (dontShowAgain) {
        localStorage.setItem('ENGRAM_UPLOAD_WARNING', 'false');
        // setShowUploadWarning(false);
    }
    setIsUploadWarningOpen(false);
    if (pendingFiles) {
        processFiles(pendingFiles);
        setPendingFiles(null);
    }
  };

  const processFiles = async (files: FileList) => {
    const newAttachments: Attachment[] = [];

    Array.from(files).forEach(file => {
      // Basic type detection
      let type: Attachment['type'] = 'other';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.includes('pdf') || file.type.includes('text')) type = 'document';

      newAttachments.push({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        isEncrypted: isEncryptedGlobal, // Use global prop
        type,
        status: 'pending'
      });
    });

    const updatedList = [...attachments, ...newAttachments];
    onAttachmentsChange(updatedList);

    // Auto start upload for pending files
    uploadPendingFiles(updatedList);
  };

  const uploadPendingFiles = async (list: Attachment[]) => {
    // Clone list to avoid direct mutation issues during async
    const currentList = [...list];

    for (let i = 0; i < currentList.length; i++) {
      const item = currentList[i];
      if (item.status === 'pending') {
        try {
          // Update status to uploading
          currentList[i] = { ...item, status: 'uploading' };
          onAttachmentsChange([...currentList]);

          let blobToUpload: Blob = item.file;
          let ivBase64: string | undefined = undefined;

          // Encryption Step
          if (item.isEncrypted) {
             const key = await getEncryptionKey();
             const { encryptedBlob, iv } = await encryptFile(item.file, key);
             blobToUpload = encryptedBlob;
             ivBase64 = arrayBufferToBase64(iv);
          }

          // Upload Step
          const blobId = await WalrusService.uploadBlob(blobToUpload, selectedEpochs);

          // Success
          currentList[i] = {  
            ...item, 
            status: 'uploaded', 
            blobId, 
            encryptionIv: ivBase64 
          };
          onAttachmentsChange([...currentList]);

        } catch (error) {
          console.error(`Upload failed for ${item.file.name}:`, error);
          currentList[i] = { ...item, status: 'error' };
          onAttachmentsChange([...currentList]);
        }
      }
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Toolbar / Dropzone */}
      <div className="flex items-center justify-between mb-2">
         <div className="text-xs text-titanium-grey font-mono">MEMORY ARTIFACTS (WALRUS BLOB)</div>
      </div>

      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
          isDragging 
            ? "border-neon-cyan bg-neon-cyan/5 scale-[1.01]" 
            : "border-titanium-grey/30 hover:border-neon-cyan/50 hover:bg-white/5"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          className="hidden" 
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <Upload size={24} className={cn("mb-2 transition-colors", isDragging ? "text-neon-cyan" : "text-titanium-grey")} />
        <div className="text-xs text-titanium-grey font-mono text-center">
          <span className="text-neon-cyan">CLICK</span> OR DRAG ARTIFACTS HERE
        </div>
      </div>

      {/* Attachment List */}
      <div className="grid grid-cols-2 gap-3">
        {attachments.map(att => (
          <div key={att.id} className="relative group border border-titanium-grey/30 bg-black/40 rounded overflow-hidden flex items-center gap-3 p-2">
             {/* Thumbnail / Icon */}
             <div className="w-10 h-10 shrink-0 bg-white/5 flex items-center justify-center rounded overflow-hidden relative">
               {att.type === 'image' ? (
                 <img src={att.previewUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="preview" />
               ) : (
                 <FileIcon size={18} className="text-titanium-grey" />
               )}
               {att.isEncrypted && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                   <Lock size={12} className="text-matrix-green drop-shadow-[0_0_2px_#0f0]" />
                 </div>
               )}
             </div>

             {/* Info */}
             <div className="flex-1 min-w-0">
               <div className="text-[10px] text-white truncate font-mono" title={att.file.name}>{att.file.name}</div>
               <div className="text-[8px] text-titanium-grey flex items-center gap-1">
                 {att.status === 'uploading' && <span className="text-neon-cyan flex items-center gap-1"><Loader2 size={8} className="animate-spin" /> UPLOADING...</span>}
                 {att.status === 'uploaded' && <span className="text-matrix-green">● SYNCED</span>}
                 {att.status === 'error' && <span className="text-glitch-red">⚠ FAILED</span>}
                 {att.status === 'pending' && <span>WAITING...</span>}
               </div>
             </div>

             {/* Actions */}
             <button 
               onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
               className="text-titanium-grey hover:text-glitch-red p-1"
               title="Remove"
             >
               <X size={12} />
             </button>
             
             {/* Progress Bar for Uploading */}
             {att.status === 'uploading' && (
               <div className="absolute bottom-0 left-0 h-0.5 bg-neon-cyan animate-pulse w-full" />
             )}
          </div>
        ))}
      </div>

    {/* MVP Warning Modal */}
    <GlitchModal
        isOpen={showMvpWarning}
        onClose={() => setShowMvpWarning(false)}
        title="FEATURE LOCKED"
        className="border-neon-cyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)] max-w-sm"
    >
        <div className="space-y-4 font-mono text-center">
            <div className="flex justify-center mb-2">
                <Lock size={32} className="text-neon-cyan animate-pulse" />
            </div>
            
            <div className="text-sm font-bold text-neon-cyan uppercase tracking-widest">
                Walrus Integration Unavailable
            </div>
            
            <div className="text-xs text-titanium-grey leading-relaxed">
                <p>The neural uplink to Walrus Decentralized Storage is currently offline for maintenance during the MVP phase.</p>
                <br/>
                <p className="opacity-70">Attachment uploads will be enabled in the upcoming protocol update.</p>
            </div>

            <button 
                onClick={() => setShowMvpWarning(false)}
                className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-titanium-grey/30 text-xs text-white transition-all uppercase tracking-wider"
            >
                ACKNOWLEDGE
            </button>
        </div>
    </GlitchModal>

    {/* Upload Warning Modal */}
    <GlitchModal
        isOpen={isUploadWarningOpen}
        onClose={() => setIsUploadWarningOpen(false)}
        title="CONFIRM ARTIFACT UPLOAD"
        className={cn(
            "max-w-md shadow-[0_0_50px_rgba(0,243,255,0.15)]",
            isEncryptedGlobal ? "border-neon-cyan/50" : "border-glitch-red/50 shadow-[0_0_50px_rgba(255,0,60,0.15)]"
        )}
    >
        <div className="space-y-4 font-mono">
             <div className={cn(
                 "text-xs border-l-2 pl-2 py-1",
                 isEncryptedGlobal ? "text-titanium-grey border-neon-cyan" : "text-glitch-red border-glitch-red"
             )}>
                &gt; WARNING: IMMUTABLE STORAGE ACTION.<br/>
                &gt; UPLOADED DATA CANNOT BE REVOKED.
            </div>

            <div className="bg-white/5 border border-titanium-grey/20 p-3 rounded space-y-2 text-[10px]">
                <div className="flex justify-between">
                    <span className="text-titanium-grey">TARGET NETWORK:</span>
                    <span className="text-neon-cyan font-bold">WALRUS (TESTNET)</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-titanium-grey">STORAGE DURATION:</span>
                    <div className="flex items-center gap-2">
                        <select 
                            value={selectedEpochs}
                            onChange={(e) => setSelectedEpochs(Number(e.target.value))}
                            className="bg-void-black border border-titanium-grey/50 text-white text-[10px] px-1 py-0.5 rounded focus:border-neon-cyan outline-none cursor-pointer"
                        >
                            <option value={1}>1 EPOCH</option>
                            <option value={5}>5 EPOCHS</option>
                            <option value={10}>10 EPOCHS</option>
                            <option value={30}>30 EPOCHS</option>
                            <option value={100}>100 EPOCHS</option>
                        </select>
                        <span className="text-titanium-grey/50 text-[9px]">(RENEWABLE)</span>
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-titanium-grey">ENCRYPTION STATUS:</span>
                    <span className={cn("font-bold", isEncryptedGlobal ? "text-matrix-green" : "text-glitch-red")}>
                        {isEncryptedGlobal ? "ENABLED (SECURE)" : "DISABLED (PUBLIC)"}
                    </span>
                </div>
                {!isEncryptedGlobal && (
                    <div className="text-glitch-red text-[9px] mt-1 pt-1 border-t border-titanium-grey/20">
                        ⚠ PUBLIC MODE: Anyone with the Blob ID can access these files.
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2">
                <div 
                    onClick={() => setDontShowAgain(!dontShowAgain)}
                    className="flex items-center gap-2 cursor-pointer group select-none"
                >
                    <div className={cn(
                        "w-3.5 h-3.5 border flex items-center justify-center transition-all duration-200",
                        dontShowAgain 
                            ? "bg-neon-cyan border-neon-cyan shadow-[0_0_5px_rgba(0,243,255,0.5)]" 
                            : "border-titanium-grey group-hover:border-white bg-transparent"
                    )}>
                        {dontShowAgain && <Check size={10} className="text-void-black font-bold" strokeWidth={4} />}
                    </div>
                    <span className={cn(
                        "text-[10px] transition-colors",
                        dontShowAgain ? "text-neon-cyan" : "text-titanium-grey group-hover:text-white"
                    )}>
                        Suppress future warnings (Local Protocol)
                    </span>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-titanium-grey/20">
                <button 
                    onClick={() => setIsUploadWarningOpen(false)}
                    className="px-4 py-2 text-titanium-grey hover:text-white transition-colors text-xs"
                >
                    [CANCEL]
                </button>
                <button 
                    onClick={confirmUpload}
                    className={cn(
                        "px-4 py-2 text-xs font-bold hover:bg-white hover:text-void-black transition-colors flex items-center gap-2",
                        isEncryptedGlobal ? "bg-neon-cyan text-void-black" : "bg-glitch-red text-white"
                    )}
                >
                    <Activity size={12} /> CONFIRM UPLOAD
                </button>
            </div>
        </div>
    </GlitchModal>
    </div>
  );
}