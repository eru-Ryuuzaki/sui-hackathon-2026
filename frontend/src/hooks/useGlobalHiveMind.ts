import { useState, useEffect } from 'react';
// import { useSuiClient } from '@mysten/dapp-kit';

export interface HiveLog {
  id: string;
  timestamp: number;
  content: string;
  category: string;
  type: string;
  mood: 'calm' | 'alert' | 'creative';
  hash: string;
}

export function useGlobalHiveMind() {
  // const client = useSuiClient(); // Reserved for future use
  const [globalLogs, setGlobalLogs] = useState<HiveLog[]>([]);

  useEffect(() => {
    // Initial Seed (Mock Data for Demo, replacing with real events later)
    // In a real scenario, we would queryEvent from Sui Client
    const seeds: HiveLog[] = [
      {
        id: 'seed-1',
        timestamp: Date.now() - 5000,
        content: 'Construct #8821 synchronized memory shard.',
        category: 'PROTOCOL',
        type: 'ROUTINE',
        mood: 'calm',
        hash: '0x3a...9f'
      },
      {
        id: 'seed-2',
        timestamp: Date.now() - 120000,
        content: 'Anomaly detected in Sector 7. Manual override.',
        category: 'SYSTEM',
        type: 'WARN',
        mood: 'alert',
        hash: '0x1b...2c'
      }
    ];
    setGlobalLogs(seeds);

    // Mock Live Stream (Simulating other users)
    const interval = setInterval(() => {
      // 30% chance to receive a new signal every 3 seconds
      if (Math.random() > 0.7) {
        const categories = ['PROTOCOL', 'MANUAL', 'SYSTEM', 'SOCIAL'];
        const types = ['ROUTINE', 'ALERT', 'SUCCESS', 'INFO'];
        
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const typ = types[Math.floor(Math.random() * types.length)];
        
        // Determine mood heuristic
        let mood: 'calm' | 'alert' | 'creative' = 'calm';
        if (typ === 'ALERT' || typ === 'WARN') mood = 'alert';
        else if (cat === 'MANUAL' || typ === 'SUCCESS') mood = 'creative';

        const newLog: HiveLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          content: `Signal received from Construct #${Math.floor(Math.random() * 9999)}.`,
          category: cat,
          type: typ,
          mood: mood,
          hash: `0x${Math.random().toString(16).substr(2, 6)}...`
        };

        setGlobalLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // TODO: Implement Real Sui Event Subscription
  // useEffect(() => {
  //   const unsubscribe = client.subscribeEvent({
  //     filter: { MoveModule: { package: PACKAGE_ID, module: 'engram' } },
  //     onMessage: (event) => { ... }
  //   });
  //   return () => unsubscribe();
  // }, []);

  return { globalLogs };
}