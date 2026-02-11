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
  const categories = [
    "system",
    "protocol",
    "achievement",
    "dream",
    "challenge",
  ];
  const types = ["INFO", "SUCCESS", "WARN", "ERROR"];
  const icons = ["✅", "🔄", "🏆", "✨", "⚔️", "📝", "💊", "💤", "⚡"];
  const moods = ["😊", "😐", "🥳", "😴", "🤯", "😎", "🤔"];
  const weathers = ["☀️", "☁️", "🌧️", "🌙", "❄️"];

  const logs: MemoryLog[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Random date within last 60 days
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    date.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
    );

    const category = categories[Math.floor(Math.random() * categories.length)];
    const type = types[Math.floor(Math.random() * types.length)] as any;
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    const weather = weathers[Math.floor(Math.random() * weathers.length)];

    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().slice(0, 5);

    // Generate content based on category
    let message = `Random generated log entry #${i + 1}.`;
    if (category === "dream")
      message = `Lucid dream fragment #${Math.floor(Math.random() * 999)}. Neural activity high.`;
    if (category === "protocol")
      message = `Daily routine executed. Efficiency: ${Math.floor(Math.random() * 100)}%.`;
    if (category === "achievement")
      message = `Unlocked new neural pathway. Skill proficiency increased.`;

    const content = `[${dateStr} ${timeStr}][${category.toUpperCase()}]${type}: ${icon} ${message}\n\nDetailed analysis of neural patterns suggests optimal cognitive function during this period. Trace engraving successful.`;

    logs.push({
      id: `mock-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: date.getTime(),
      content,
      category,
      type,
      hash: `0x${Math.random().toString(16).substr(2, 16)}`,
      metadata: {
        date: dateStr,
        time: timeStr,
        icon,
        mood,
        weather,
        isEncrypted: Math.random() > 0.8,
        sentiment: Math.floor(Math.random() * 100),
      },
    });
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

// Initial System Logs (Fixed + Random)
const FIXED_LOGS: MemoryLog[] = [
  {
    id: "sys-001",
    timestamp: Date.now() - 100000,
    content: `[2026-02-11 09:00][SYSTEM]SUCCESS: ✅ ENGRAM KERNEL INITIALIZED. Neural Link established.\n\nAll systems nominal. Neural interface active. Waiting for user input.`,
    category: "system",
    type: "SUCCESS",
    hash: "0x0000000000000000",
    metadata: {
      date: "2026-02-11",
      time: "09:00",
      icon: "✅",
      mood: "😊",
      weather: "☀️",
      isEncrypted: false,
    },
  },
  // ... Keep other fixed logs if needed, or just let random take over
];

const SYSTEM_LOGS = [...FIXED_LOGS, ...generateMockLogs(15)];

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
      name: "engram_memory_store_v4", // Updated version to invalidate old cache
    },
  ),
);
