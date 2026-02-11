import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LogAttachmentData {
  blobId: string;
  name: string;
  type: string;
  size: number;
  isEncrypted: boolean;
  encryptionIv?: string; // Base64 IV
}

export interface MemoryLog {
  id: string;
  timestamp: number; // Unix timestamp
  content: string;
  category: string;
  type: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  metadata?: {
    weather?: string;
    mood?: string;
    lifeFrame?: number;
    sentiment?: number; // Added sentiment/energy
    icon?: string;
    attachments?: LogAttachmentData[]; // Added attachments
    date: string; // REQUIRED for Calendar sorting/rendering
    time?: string;
    isEncrypted?: boolean;
    visibility?: "public" | "private";
  };
  hash: string; // Simulated tx hash
}

interface MemoryStore {
  logs: MemoryLog[];
  viewingLogId: string | null;
  addLog: (
    log: Omit<MemoryLog, "id" | "timestamp" | "hash"> & { hash?: string },
  ) => void;
  setLogs: (logs: MemoryLog[]) => void;
  setViewingLogId: (id: string | null) => void;
  clearLogs: () => void;
}

// Helper to generate mock logs
const generateMockLogs = (count: number): MemoryLog[] => {
  // Use fixed date reference for reproducibility (Feb 12, 2026)
  const baseDate = new Date("2026-02-12T12:00:00Z");

  const mockData = [
    {
      offsetHours: -75, // 3 days ago +
      category: "protocol",
      type: "INFO",
      icon: "🔄",
      mood: "😐",
      weather: "☁️",
      sentiment: 50,
      message: "Daily routine executed. Efficiency: 78%.",
      hash: "0xa1b2...c3d4",
    },
    {
      offsetHours: -98, // 4 days ago
      category: "dream",
      type: "WARN",
      icon: "💤",
      mood: "🤯",
      weather: "🌙",
      sentiment: 85,
      message:
        "Lucid dream fragment #404. Neural activity abnormally high. Recursion detected.",
      hash: "0xe5f6...g7h8",
    },
    {
      offsetHours: -121, // 5 days ago
      category: "achievement",
      type: "SUCCESS",
      icon: "🏆",
      mood: "🥳",
      weather: "☀️",
      sentiment: 95,
      message:
        "Unlocked new neural pathway. Skill proficiency increased: [Sui Move Development].",
      hash: "0xi9j0...k1l2",
    },
    {
      offsetHours: -145,
      category: "system",
      type: "ERROR",
      icon: "⚡",
      mood: "😡",
      weather: "🌧️",
      sentiment: 20,
      message: "Connection unstable. Packet loss detected in Sector 7.",
      hash: "0xm3n4...o5p6",
    },
    {
      offsetHours: -169,
      category: "challenge",
      type: "INFO",
      icon: "⚔️",
      mood: "🤔",
      weather: "❄️",
      sentiment: 60,
      message:
        "Encountered encryption barrier. Decryption protocols initiated.",
      hash: "0xq7r8...s9t0",
    },
  ];

  // Limit or repeat data based on count if needed, but for now we just return the fixed set
  // This avoids the 'count' unused variable error while keeping the signature compatible if we expand later
  const limitedData = mockData.slice(0, Math.max(1, count));

  return limitedData.map((data, index) => {
    const date = new Date(baseDate);
    date.setHours(date.getHours() + data.offsetHours);

    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().slice(0, 5);

    const content = `[${dateStr} ${timeStr}][${data.category.toUpperCase()}]${data.type}: ${data.icon} ${data.message}\n\nDetailed analysis of neural patterns suggests optimal cognitive function during this period. Trace engraving successful. (MOCK_DATA: Demo Purpose Only)`;

    return {
      id: `mock-fixed-${index}`,
      timestamp: date.getTime(),
      content,
      category: data.category,
      type: data.type as any,
      hash: data.hash,
      metadata: {
        date: dateStr,
        time: timeStr,
        icon: data.icon,
        mood: data.mood,
        weather: data.weather,
        isEncrypted: false,
        sentiment: data.sentiment,
        visibility: "public",
      },
    };
  });
};

// Initial System Logs (Fixed + Random)
const FIXED_LOGS: MemoryLog[] = [
  {
    id: "sys-001",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 - 100000, // 3 days ago
    content: `[${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} 09:00][SYSTEM]SUCCESS: ✅ ENGRAM KERNEL INITIALIZED. Neural Link established.\n\nAll systems nominal. Neural interface active. Waiting for user input. (MOCK_DATA: Demo Purpose Only)`,
    category: "system",
    type: "SUCCESS",
    hash: "0x0000000000000000",
    metadata: {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      time: "09:00",
      icon: "✅",
      mood: "😊",
      weather: "☀️",
      isEncrypted: false,
      sentiment: 90,
      visibility: "public",
    },
  },
];

const SYSTEM_LOGS = [...FIXED_LOGS, ...generateMockLogs(5)]; // Inject 5 fixed mock logs

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      logs: SYSTEM_LOGS,
      viewingLogId: null,

      addLog: (newLog) =>
        set((state) => {
          const log: MemoryLog = {
            ...newLog,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            hash:
              newLog.hash ||
              `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
          };
          // Add to beginning of array (newest first)
          return { logs: [log, ...state.logs] };
        }),

      setLogs: (logs) => set({ logs }),

      setViewingLogId: (id) => set({ viewingLogId: id }),

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "engram_memory_store_v8", // Updated version to invalidate old cache and load new mocks
    },
  ),
);
