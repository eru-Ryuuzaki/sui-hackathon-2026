import { useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useSponsoredTransaction } from '@/hooks/useSponsoredTransaction';
import { buildEngraveTx } from '@/utils/sui/transactions';
import type { MemoryLog } from '@/hooks/useMemoryStore';

// --- Types ---
export interface LogParams {
  constructId: string;
  content: string;
  category: string; // "protocol", "system", etc.
  type: string; // "ROUTINE", "INFO", etc.
  mood: string; // "😊", etc.
  isEncrypted: boolean;
  attachments?: Array<{
    blobId: string;
    type: string;
    // ... other attachment fields if needed for tx
  }>;
}

export interface LogResult {
  success: boolean;
  hash?: string;
  error?: any;
  log?: MemoryLog; // The created log object
}

// --- Mock Implementation ---
const MOCK_STORAGE_KEY = 'engram_mock_logs';

const useMockLogService = () => {
  const createLog = useCallback(async (params: LogParams): Promise<LogResult> => {
    // 1. Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Create Mock Log Object
    const newLog: MemoryLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      content: params.content,
      category: params.category,
      type: params.type as any,
      hash: `0xMOCK${Math.random().toString(16).slice(2, 10)}`,
      metadata: {
        date: new Date().toISOString().split('T')[0], // REQUIRED
        mood: params.mood,
        isEncrypted: params.isEncrypted,
        // We can add more metadata here to match what the store expects
      }
    };

    // 3. Persist to LocalStorage (so it survives reload)
    try {
        const existing = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '[]');
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify([newLog, ...existing]));
    } catch (e) {
        console.error("Mock storage failed", e);
    }

    return { success: true, hash: newLog.hash, log: newLog };
  }, []);

  const fetchLogs = useCallback(async (): Promise<MemoryLog[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
          return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || '[]');
      } catch (e) {
          return [];
      }
  }, []);

  return { createLog, fetchLogs, isMock: true };
};

// --- Real Sui Implementation ---
const useSuiLogService = () => {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { executeSponsoredTx } = useSponsoredTransaction();

  // Strict Map to Move Contract Enum (Duplicated from JournalEditor for now, should be shared)
  // 0:System, 1:Protocol, 2:Achievement, 3:Challenge, 4:Dream
  const CATEGORY_MAP: Record<string, number> = {
    system: 0,
    protocol: 1,
    achievement: 2,
    challenge: 3,
    dream: 4,
  };

  const MOOD_MAP: Record<string, number> = {
     '😊': 75, '😐': 50, '😢': 25, '😡': 10, '🥳': 90,
     '😴': 40, '🤢': 20, '🤯': 80, '🥶': 30, '🥵': 30
  };

  const createLog = useCallback(async (params: LogParams): Promise<LogResult> => {
    if (!account) {
        return { success: false, error: "Wallet not connected" };
    }

    try {
        // Prepare Args
        const moodVal = MOOD_MAP[params.mood] || 50;
        const catVal = CATEGORY_MAP[params.category] ?? 1;
        const primaryAttachment = params.attachments?.[0];

        const tx = buildEngraveTx(
            params.constructId,
            params.content,
            moodVal,
            catVal,
            params.isEncrypted,
            primaryAttachment?.blobId,
            primaryAttachment?.type
        );

        // Attempt Sponsored
        try {
           console.log('[SuiService] Attempting Sponsored Transaction...');
           const res = await executeSponsoredTx(tx);
           return { success: true, hash: res.digest };
        } catch (sponsorErr) {
           console.warn('[SuiService] Sponsored failed, falling back to self-pay:', sponsorErr);
           // Fallback
           const res = await signAndExecuteTransaction({ transaction: tx });
           return { success: true, hash: res.digest };
        }
    } catch (e) {
        console.error('[SuiService] Transaction failed:', e);
        return { success: false, error: e };
    }
  }, [account, signAndExecuteTransaction, executeSponsoredTx]);

  const fetchLogs = useCallback(async (): Promise<MemoryLog[]> => {
      // TODO: Implement Indexer/RPC fetch here
      // For now, we return empty array or implement a real fetch later
      console.warn("[SuiService] fetchLogs not fully implemented yet - relies on Indexer");
      return [];
  }, []);

  return { createLog, fetchLogs, isMock: false };
};

// --- Main Hook ---
export function useLogService() {
  // Check Environment Variable
  // Note: Vite env vars are strings. 'true' checks string equality.
  // const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const useMock = false; // Force Real Service for Testing

  if (useMock) {
    console.debug("[Engram] Using MOCK Log Service");
  } else {
    console.debug("[Engram] Using REAL Sui Log Service");
  }

  const mockService = useMockLogService();
  const suiService = useSuiLogService();

  return useMock ? mockService : suiService;
}
