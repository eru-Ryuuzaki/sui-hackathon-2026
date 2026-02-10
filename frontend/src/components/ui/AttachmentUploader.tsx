import { useState, useRef } from 'react';
import { useSignPersonalMessage } from '@mysten/dapp-kit';
import { WalrusService } from '@/services/walrus';
import { deriveKeyFromSignature, encryptFile, arrayBufferToBase64 } from '@/utils/encryption';
import { useEncryptionStore } from '@/hooks/useEncryptionStore';
import { Upload, File as FileIcon, X, Lock, Globe, Loader2 } from 'lucide-react';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { cn } from '@/utils/cn';

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

export function AttachmentUploader({ attachments, onAttachmentsChange, isEncryptedGlobal }: AttachmentUploaderProps) {
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const { sessionKey, setSessionKey } = useEncryptionStore();
  
  // Removed local isEncrypted state to rely on global prop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEncryptionKey = async () => {
    if (sessionKey) return sessionKey;
    
    try {
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
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Warning for PUBLIC upload
    if (!isEncryptedGlobal) {
       triggerAlert({
         type: 'warning',
         title: 'PUBLIC UPLOAD DETECTED',
         message: 'Files will be publicly accessible on Walrus. Anyone with the Blob ID can view them.',
         duration: 5000
       });
    }

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
          const blobId = await WalrusService.uploadBlob(blobToUpload);

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
    </div>
  );
}