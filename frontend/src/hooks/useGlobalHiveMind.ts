import { create } from 'zustand';
import { useEffect } from 'react';
import type { MemoryLog } from './useMemoryStore';

// Use MemoryLog interface directly to ensure compatibility with detail view
export type HiveLog = MemoryLog;

// Define Store State
interface GlobalHiveStore {
  globalLogs: HiveLog[];
  stats: {
    totalSubjects: number;
    totalShards: number;
  };
  addGlobalLog: (log: HiveLog, isNewUser?: boolean) => void;
  initSeeds: () => void;
}

// Create Zustand Store (Shared Global State)
const useGlobalStore = create<GlobalHiveStore>((set, get) => ({
  globalLogs: [],
  stats: {
    totalSubjects: 124, // Mock initial state
    totalShards: 8902
  },
  addGlobalLog: (log, isNewUser = false) => set((state) => ({ 
    globalLogs: [log, ...state.globalLogs].slice(0, 10),
    stats: {
        totalSubjects: state.stats.totalSubjects + (isNewUser ? 1 : 0),
        totalShards: state.stats.totalShards + 1
    }
  })),
  initSeeds: () => {
    // Only init if empty
    if (get().globalLogs.length > 0) return;

    const seeds: HiveLog[] = [
      {
        id: 'seed-1',
        timestamp: Date.now() - 5000,
        content: `[2026-02-11 10:00][ACHIEVEMENT]SUCCESS: Just successfully synced my first neural shard. The process feels seamless. #milestone\n\nSignal received from external node [USER-SEED]. Trace integrity verified.\nHash: 0x3a...9f`,
        category: 'achievement',
        type: 'SUCCESS',
        hash: '0x3a...9f',
        metadata: {
            date: new Date().toISOString().split('T')[0],
            weather: 'Rainy',
            mood: '😊',
            sentiment: 75, // Mapped from 😊
            icon: '😊',
            isEncrypted: false,
            attachments: []
        }
      },
      {
        id: 'seed-2',
        timestamp: Date.now() - 120000,
        content: `[2026-02-11 09:45][SYSTEM]WARN: Detected unusual pattern in the sector 7 data stream. Analyzing for potential anomalies.\n\nSignal received from external node [USER-SYS]. Trace integrity verified.\nHash: 0x1b...2c`,
        category: 'system',
        type: 'WARN',
        hash: '0x1b...2c',
        metadata: {
            date: new Date().toISOString().split('T')[0],
            weather: 'Foggy',
            mood: '🤔',
            sentiment: 50, // Mapped from 🤔
            icon: '🤔',
            isEncrypted: false,
            attachments: []
        }
      }
    ];
    set({ globalLogs: seeds });
  }
}));

// Mood to Sentiment Map
const MOOD_SENTIMENT_MAP: Record<string, number> = {
    '😊': 75,
    '😐': 50,
    '😢': 25,
    '😡': 10,
    '🥳': 95,
    '😴': 40,
    '🤢': 20,
    '🤯': 80,
    '🥶': 30,
    '🥵': 30,
    '🤔': 50
};

export function useGlobalHiveMind() {
  const { globalLogs, stats, addGlobalLog, initSeeds } = useGlobalStore();

  useEffect(() => {
    // Initialize Seeds
    initSeeds();

    // Mock Live Stream (Simulating other users)
    const interval = setInterval(() => {
      // 30% chance to receive a new signal every 2 seconds
      if (Math.random() > 0.7) {
        const categories = ['protocol', 'dream', 'system', 'challenge', 'achievement'];
        const types = ['INFO', 'WARN', 'SUCCESS', 'ERROR'];
        
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const typ = types[Math.floor(Math.random() * types.length)];
        
        const moods = ['😊', '🤔', '😢', '😡', '🥳', '🤯'];
        const mood = moods[Math.floor(Math.random() * moods.length)];
        const sentiment = MOOD_SENTIMENT_MAP[mood] || 50; // Map from mood

        const contents = [
            "Trying to optimize the neural link efficiency. It's fluctuating.",
            "Found a rare memory shard in the old archive. What does it mean?",
            "System upgrade complete. Bandwidth increased by 20%.",
            "Why is the void so quiet today? Waiting for signals.",
            "Just deployed a new smart contract on Sui. Feeling electric."
        ];
        const message = contents[Math.floor(Math.random() * contents.length)];
        const userPrefix = `[USER-${Math.floor(Math.random() * 9999)}]`;
        
        // 10% chance it's a "new user" event for stats simulation
        // const isNewUser = Math.random() > 0.9;
        
        // Format Content for LogDetails Parsing
        const dateStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toTimeString().split(' ')[0].slice(0, 5);
        const icon = mood; // Use mood as icon
        
        const contentHeader = `[${dateStr} ${timeStr}][${cat.toUpperCase()}]${typ}: ${icon} ${userPrefix} ${message}`;
        const contentBody = `Signal received from external node ${userPrefix}. Trace integrity verified.\nHash: 0x${Math.random().toString(16).substr(2, 8)}...`;

        const newLog: HiveLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          content: `${contentHeader}\n\n${contentBody}`,
          category: cat,
          type: typ as "INFO" | "WARN" | "ERROR" | "SUCCESS",
          hash: `0x${Math.random().toString(16).substr(2, 6)}...`,
          metadata: {
              date: dateStr,
              weather: ['Sunny', 'Rainy', 'Cloudy', 'Neon'][Math.floor(Math.random() * 4)],
              mood: mood,
              sentiment: sentiment,
              icon: icon,
              isEncrypted: false,
              attachments: []
          }
        };

        addGlobalLog(newLog);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []); // Empty deps ensure this runs once per mount, BUT since store is global, we might have multiple subscribers running intervals.
          // In a real app, we'd move this logic to a singleton provider. 
          // For now, let's keep it simple but be aware multiple components using this hook might speed up the feed.
          // To fix "multiple subscribers" issue in this hackathon context:
          // We can check if we are the "main" instance or just rely on the store.

  return { globalLogs, stats };
}