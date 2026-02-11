import { useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSuiClient,
} from "@mysten/dapp-kit";
import { buildEngraveTx } from "@/utils/sui/transactions";
import { deriveKeyFromSignature, encryptText } from "@/utils/encryption";
import type { MemoryLog } from "@/hooks/useMemoryStore";

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
  content?: string; // The final content (potentially encrypted) sent to chain
}

// --- Mock Implementation ---
const MOCK_STORAGE_KEY = "engram_mock_logs";

const useMockLogService = () => {
  const createLog = useCallback(
    async (params: LogParams): Promise<LogResult> => {
      // 1. Simulate Network Delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 2. Create Mock Log Object
      const newLog: MemoryLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        content: params.content,
        category: params.category,
        type: params.type as any,
        hash: `0xMOCK${Math.random().toString(16).slice(2, 10)}`,
        metadata: {
          date: new Date().toISOString().split("T")[0], // REQUIRED
          mood: params.mood,
          isEncrypted: params.isEncrypted,
          // We can add more metadata here to match what the store expects
        },
      };

      // 3. Persist to LocalStorage (so it survives reload)
      try {
        const existing = JSON.parse(
          localStorage.getItem(MOCK_STORAGE_KEY) || "[]",
        );
        localStorage.setItem(
          MOCK_STORAGE_KEY,
          JSON.stringify([newLog, ...existing]),
        );
      } catch (e) {
        console.error("Mock storage failed", e);
      }

      return {
        success: true,
        hash: newLog.hash,
        log: newLog,
        content: newLog.content,
      };
    },
    [],
  );

  const fetchLogs = useCallback(async (): Promise<MemoryLog[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }, []);

  return { createLog, fetchLogs, isMock: true };
};

// --- Real Sui Implementation ---
const useSuiLogService = () => {
  const account = useCurrentAccount();
  const client = useSuiClient(); // Use the hook to get the client
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID;

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
    "😊": 75,
    "😐": 50,
    "😢": 25,
    "😡": 10,
    "🥳": 90,
    "😴": 40,
    "🤢": 20,
    "🤯": 80,
    "🥶": 30,
    "🥵": 30,
  };

  const createLog = useCallback(
    async (params: LogParams): Promise<LogResult> => {
      if (!account) {
        return { success: false, error: "Wallet not connected" };
      }

      try {
        // Prepare Args
        const moodVal = MOOD_MAP[params.mood] || 50;
        const catVal = CATEGORY_MAP[params.category] ?? 1;
        const primaryAttachment = params.attachments?.[0];
        let finalContent = params.content;

        // --- Encryption Logic ---
        if (params.isEncrypted) {
          console.log("[SuiService] Encrypting content...");
          try {
            // 1. Request Signature to derive key
            const msgBytes = new TextEncoder().encode(
              "ENGRAM_ACCESS_KEY_DERIVATION",
            );
            const { signature } = await signPersonalMessage({
              message: msgBytes,
            });

            // 2. Derive Key
            const key = await deriveKeyFromSignature(signature);

            // 3. Encrypt Content
            const { encryptedText, iv } = await encryptText(
              params.content,
              key,
            );

            // 4. Pack IV and Ciphertext: "IV_BASE64:CIPHER_BASE64"
            // This allows us to store both in the single 'content' string on-chain
            finalContent = `${iv}:${encryptedText}`;
          } catch (err) {
            console.error("[SuiService] Encryption failed or rejected:", err);
            return {
              success: false,
              error: "Encryption failed or rejected by user",
            };
          }
        }

        const tx = buildEngraveTx(
          params.constructId,
          finalContent,
          moodVal,
          catVal,
          params.isEncrypted,
          primaryAttachment?.blobId,
          primaryAttachment?.type,
        );

        // Direct Execution (Self-funded)
        try {
          console.log("[SuiService] Executing Transaction...");
          const res = await signAndExecuteTransaction({ transaction: tx });
          return { success: true, hash: res.digest, content: finalContent };
        } catch (e) {
          console.error("[SuiService] Transaction failed:", e);
          return { success: false, error: e };
        }
      } catch (e) {
        console.error("[SuiService] Transaction build failed:", e);
        return { success: false, error: e };
      }
    },
    [account, signAndExecuteTransaction],
  );

  const fetchLogs = useCallback(
    async (constructId: string): Promise<MemoryLog[]> => {
      try {
        console.log(
          `[SuiService] Querying events for construct: ${constructId}`,
        );

        // Add a small delay to allow RPC node to index the event
        // This is crucial for "read-your-writes" consistency immediately after a transaction
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Query events directly from Sui Chain
        // Filter by MoveEventType: ShardEngravedEvent
        // We implement a simple pagination loop to ensure we find the user's logs
        // even if they are not in the first 50 global events.
        let allEvents: any[] = [];
        let cursor = null;
        let hasMore = true;
        let pageCount = 0;
        const MAX_PAGES = 5; // Safety limit to prevent infinite loops

        while (hasMore && pageCount < MAX_PAGES) {
          const events: any = await client.queryEvents({
            query: {
              MoveEventType: `${PACKAGE_ID}::core::ShardEngravedEvent`,
            },
            limit: 50,
            order: "descending",
            cursor: cursor,
          });

          allEvents = [...allEvents, ...events.data];

          if (events.hasNextPage) {
            cursor = events.nextCursor;
            pageCount++;
          } else {
            hasMore = false;
          }

          // Optimization: If we found enough logs for this user, maybe stop?
          // But for now, let's just fetch a few pages to be safe.
        }

        // Filter events that match our constructId
        const constructEvents = allEvents.filter((e: any) => {
          const data = e.parsedJson;
          return data && data.construct_id === constructId;
        });

        console.log(
          `[SuiService] Found ${constructEvents.length} events for construct after scanning ${pageCount + 1} pages.`,
        );

        // Map Events to MemoryLog Format
        return constructEvents.map((event: any) => {
          const data = event.parsedJson;

          // Timestamp is string in ms from event
          const timestamp = Number(event.timestampMs);
          const dateObj = new Date(timestamp);

          // Use content_snippet instead of content, as that's what the event emits now
          const content = data.content_snippet || data.content;

          return {
            id: data.shard_id || event.id.txDigest, // Use shard_id or txDigest
            timestamp: timestamp,
            content: content, // Use the correct field from event
            category:
              ["system", "protocol", "achievement", "challenge", "dream"][
                data.category
              ] || "system", // Map u8 back to string
            type: "INFO", // Default
            hash: event.id.txDigest,
            metadata: {
              date: dateObj.toISOString().split("T")[0],
              time: dateObj.toTimeString().slice(0, 5),
              mood:
                ["😡", "😢", "🥶", "😴", "😐", "😊", "🤯", "🥳"][
                  Math.floor(data.mood / 10)
                ] || "😐", // Approx map back from u8
              weather: "☁️", // Event doesn't store weather currently? If not, use default.
              isEncrypted: data.is_encrypted,
              // Attachments are stored as blob_id in event if present
              attachments: data.blob_id
                ? [
                    {
                      blobId: data.blob_id,
                      type: data.media_type || "application/octet-stream",
                      name: "Attachment",
                      size: 0,
                      isEncrypted: false,
                    },
                  ]
                : [],
            },
          };
        });
      } catch (e) {
        console.error("[SuiService] fetchLogs failed:", e);
        return [];
      }
    },
    [client, PACKAGE_ID],
  );

  return { createLog, fetchLogs, isMock: false };
};

// --- Main Hook ---
export function useLogService() {
  // Check Environment Variable
  // Note: Vite env vars are strings. 'true' checks string equality.
  const useMock = import.meta.env.VITE_USE_MOCK === "true";
  // const useMock = false; // Force Real Service for Testing

  if (useMock) {
    console.debug("[Engram] Using MOCK Log Service");
  } else {
    console.debug("[Engram] Using REAL Sui Log Service");
  }

  const mockService = useMockLogService();
  const suiService = useSuiLogService();

  return useMock ? mockService : suiService;
}
