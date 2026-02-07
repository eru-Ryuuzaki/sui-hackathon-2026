import { useState, useEffect } from 'react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  subject: string;
  action: string;
  hash: string;
}

export function useMockHiveMind() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Initial population
    const initialLogs = Array.from({ length: 5 }).map(() => generateRandomLog());
    setLogs(initialLogs);

    // Live updates
    const interval = setInterval(() => {
      setLogs(prev => [generateRandomLog(), ...prev].slice(0, 20));
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return logs;
}

function generateRandomLog(): LogEntry {
  const subjects = ['Subject_8a2f', 'Subject_9x11', 'Subject_0001', 'Subject_X99', 'Subject_Null', 'Subject_Echo'];
  const actions = ['extracted a memory shard', 'engraved a thought', 'minted a neural badge', 'synced with the void', 'uploaded encrypted data'];
  
  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date(),
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    hash: '0x' + Math.random().toString(16).substring(2, 10) + '...'
  };
}
