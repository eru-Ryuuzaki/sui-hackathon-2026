import { useState } from 'react';
import { useEncryptionStore } from '@/hooks/useEncryptionStore';
import { useSignPersonalMessage } from '@mysten/dapp-kit';
import { WalrusService } from '@/services/walrus';
import { deriveKeyFromSignature, decryptFile, base64ToUint8Array } from '@/utils/encryption';
import type { LogAttachmentData } from '@/hooks/useMemoryStore';
import { Lock, FileText, Loader2, Image as ImageIcon } from 'lucide-react';
import { triggerAlert } from '@/components/ui/SystemAlert';

interface AttachmentViewerProps {
  attachments: LogAttachmentData[];
}

export function AttachmentViewer({ attachments }: AttachmentViewerProps) {
  const { sessionKey, setSessionKey } = useEncryptionStore();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  const [decryptedUrls, setDecryptUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const unlock = async () => {
    if (sessionKey) return sessionKey;
    try {
      const msgBytes = new TextEncoder().encode("ENGRAM_ACCESS_KEY_DERIVATION");
      const signatureResult = await signMessage({ message: msgBytes });
      const key = await deriveKeyFromSignature(signatureResult.signature);
      setSessionKey(key);
      return key;
    } catch (e) {
      triggerAlert({ type: 'error', title: 'UNLOCK FAILED', message: 'Signature required to access encrypted memories.' });
      throw e;
    }
  };

  const loadAttachment = async (att: LogAttachmentData) => {
    if (decryptedUrls[att.blobId] || loading[att.blobId]) return;

    setLoading(prev => ({ ...prev, [att.blobId]: true }));

    try {
      // 1. Download
      const blob = await WalrusService.downloadBlob(att.blobId);

      // 2. Decrypt if needed
      let finalBlob = blob;
      if (att.isEncrypted) {
        const key = await unlock();
        if (att.encryptionIv) {
           const iv = base64ToUint8Array(att.encryptionIv);
           finalBlob = await decryptFile(blob, key, iv, att.type);
        }
      } else {
        // If public, ensure type is set correctly
        finalBlob = new Blob([blob], { type: att.type });
      }

      // 3. Create URL
      const url = URL.createObjectURL(finalBlob);
      setDecryptUrls(prev => ({ ...prev, [att.blobId]: url }));

    } catch (error) {
      console.error("Failed to load attachment", error);
      triggerAlert({ type: 'error', title: 'LOAD ERROR', message: `Failed to retrieve artifact: ${att.name}` });
    } finally {
      setLoading(prev => ({ ...prev, [att.blobId]: false }));
    }
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map(att => (
        <div 
          key={att.blobId} 
          className="relative group border border-titanium-grey/30 bg-black/40 rounded overflow-hidden w-16 h-16 flex items-center justify-center cursor-pointer hover:border-neon-cyan transition-colors"
          onClick={() => loadAttachment(att)}
          title={att.name}
        >
          {decryptedUrls[att.blobId] ? (
            att.type.startsWith('image/') ? (
              <img src={decryptedUrls[att.blobId]} className="w-full h-full object-cover" alt={att.name} />
            ) : (
              <div className="flex flex-col items-center text-neon-cyan">
                <FileText size={20} />
                <span className="text-[8px] mt-1">FILE</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-titanium-grey group-hover:text-white">
              {loading[att.blobId] ? (
                <Loader2 size={16} className="animate-spin text-neon-cyan" />
              ) : (
                <>
                  {att.isEncrypted ? <Lock size={16} /> : <ImageIcon size={16} />}
                  <span className="text-[8px] mt-1">{att.isEncrypted ? 'LOCKED' : 'VIEW'}</span>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
