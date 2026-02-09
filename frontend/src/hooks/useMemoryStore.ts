import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemoryLog {
  id: string;
  timestamp: number; // Unix timestamp
  content: string;
  category: string;
  type: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  metadata?: {
    energy?: number;
    weather?: string;
    mood?: string;
    lifeFrame?: number;
    icon?: string;
  };
  hash: string; // Simulated tx hash
}

interface MemoryStore {
  logs: MemoryLog[];
  addLog: (log: Omit<MemoryLog, "id" | "timestamp" | "hash">) => void;
  clearLogs: () => void;
}

// Initial System Logs
const SYSTEM_LOGS: MemoryLog[] = [
  {
    id: "sys-001",
    timestamp: Date.now() - 100000,
    content: "[SYSTEM] ENGRAM KERNEL INITIALIZED",
    category: "SYSTEM",
    type: "SUCCESS",
    hash: "0x0000000000000000",
  },
  {
    id: "sys-002",
    timestamp: Date.now() - 50000,
    content: "[SYSTEM] WAITING FOR NEURAL LINK...",
    category: "SYSTEM",
    type: "INFO",
    hash: "0x0000000000000001",
  },
];

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set) => ({
      logs: SYSTEM_LOGS,

      addLog: (newLog) =>
        set((state) => {
          const log: MemoryLog = {
            ...newLog,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            hash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
          };
          // Add to beginning of array (newest first)
          return { logs: [log, ...state.logs] };
        }),

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "engram_memory_store",
    },
  ),
);
