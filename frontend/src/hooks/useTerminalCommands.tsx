import type { TerminalLine } from '@/types/terminal';
import { useUserStore } from '@/hooks/useUserStore';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { triggerAlert } from '@/components/ui/SystemAlert';
import React from 'react';

interface UseTerminalCommandsProps {
  setHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  setCommand: (cmd: string) => void;
  setMode: (mode: 'CLI' | 'JOURNAL' | 'ARCHIVE' | 'DETAIL') => void;
  isConnected: boolean;
  currentAddress?: string | null;
}

export function useTerminalCommands({
  setHistory,
  setCommand,
  setMode,
  isConnected,
  currentAddress
}: UseTerminalCommandsProps) {
  const { currentUser } = useUserStore();
  const { addLog } = useMemoryStore();

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    // Add user command to history
    const userLine: TerminalLine = {
      id: Math.random().toString(),
      type: 'user',
      content: cmd
    };
    
    setHistory(prev => [...prev, userLine]);
    setCommand('');

    // Normal Command Processing
    const args = cmd.trim().split(' ');
    const mainCmd = args[0].toLowerCase();

    setTimeout(() => {
      let response: TerminalLine;

      switch (mainCmd) {
        case 'help':
          response = {
            id: Math.random().toString(),
            type: 'system',
            content: (
              <div className="space-y-1">
                <div>Available commands:</div>
                <div className="pl-4 text-neon-cyan">log             - Open Trace Logger</div>
                <div className="pl-4 text-neon-cyan">engrave &lt;message&gt; - Record a memory shard</div>
                <div className="pl-4 text-neon-cyan">clear             - Clear terminal history</div>
                <div className="pl-4 text-neon-cyan">status            - Check construct status</div>
                <div className="pl-4 text-neon-cyan">whoami            - Show current subject info</div>
                <div className="pl-4 text-neon-cyan">guide             - UI Terminology Guide</div>
                <div className="pl-4 text-neon-cyan">reroll            - Regenerate avatar (legacy)</div>
                <div className="pl-4 text-neon-cyan">help              - Show this message</div>
              </div>
            )
          };
          break;

        case 'guide':
          response = {
            id: Math.random().toString(),
            type: 'system',
            content: (
              <div className="space-y-2 text-xs font-mono border-l-2 border-neon-cyan pl-3 my-2">
                <div className="font-bold text-neon-cyan mb-2">=== INTERFACE TERMINOLOGY ===</div>
                <div className="grid grid-cols-[120px_1fr] gap-y-1">
                   <span className="text-matrix-green">LOGIN (Jack In)</span>
                   <span className="text-titanium-grey/80">Connect wallet to authenticate and sync.</span>
                   
                   <span className="text-matrix-green">PUBLISH LOG</span>
                   <span className="text-titanium-grey/80">"Engrave" a memory shard to the blockchain.</span>
                   
                   <span className="text-matrix-green">HIVE MIND</span>
                   <span className="text-titanium-grey/80">Global feed of all public memory shards.</span>
                   
                   <span className="text-matrix-green">TERMINAL</span>
                   <span className="text-titanium-grey/80">Command Line Interface for direct interaction.</span>
                   
                   <span className="text-matrix-green">ARCHIVE</span>
                   <span className="text-titanium-grey/80">Your personal history of engraved memories.</span>
                </div>
              </div>
            )
          };
          break;
        
        case 'log':
        case 'diary':
           if (!isConnected) {
             response = { id: Math.random().toString(), type: 'error', content: 'Access Denied. Connect wallet to log trace.' };
           } else {
             setMode('JOURNAL');
             return; // Don't add response to history yet
           }
           break;

        case 'clear':
          setHistory([]);
          return;
        
        case 'reroll':
           if (!isConnected) {
             response = { id: Math.random().toString(), type: 'error', content: 'Connect wallet first.' };
           } else {
             response = { id: Math.random().toString(), type: 'system', content: 'Initiating avatar reconfiguration...' };
             // Legacy command support, better use HUD
           }
           break;

        case 'whoami':
           if (!isConnected || !currentUser) {
             response = { id: Math.random().toString(), type: 'error', content: 'You are an unidentified signal. Please connect.' };
           } else {
             response = { id: Math.random().toString(), type: 'system', content: `> SUBJECT: ${currentUser.codename} (ADDR: ${currentAddress?.slice(0,6)}...)` };
           }
           break;

        case 'engrave':
          if (!isConnected) {
             response = { id: Math.random().toString(), type: 'error', content: 'ERROR: Neural Link Disconnected. Please connect wallet first.' };
          } else if (args.length < 2) {
             response = { id: Math.random().toString(), type: 'error', content: 'Usage: engrave <your memory here>' };
          } else {
             const memoryContent = args.slice(1).join(' ');
             addLog({
                content: memoryContent,
                category: 'CLI_UPLOAD',
                type: 'INFO'
             });
             
             response = { 
               id: Math.random().toString(), 
               type: 'success', 
               content: `[SYNC] Memory Shard engraved to Hive Mind.` 
             };
             
             triggerAlert({
                type: 'success',
                title: 'MEMORY ENGRAVED',
                message: 'Shard successfully uploaded to Hive Mind via Neural Link.',
                duration: 3000
             });
          }
          break;

        case 'status':
           if (!isConnected) {
             response = { id: Math.random().toString(), type: 'error', content: 'Offline.' };
           } else {
             response = { id: Math.random().toString(), type: 'system', content: `Construct Active. Owner: ${currentAddress}` };
           }
           break;

        default:
          response = {
            id: Math.random().toString(),
            type: 'error',
            content: `Command not found: ${mainCmd}. Type 'help' for available commands.`
          };
      }

      setHistory(prev => [...prev, response]);
    }, 300); 
  };

  const handleClear = () => {
     setHistory([
       { id: Math.random().toString(), type: 'system', content: '> TERMINAL BUFFER CLEARED.' }
     ]);
     triggerAlert({
       type: 'info',
       title: 'BUFFER CLEARED',
       message: 'Local terminal history has been wiped.',
       duration: 2000
     });
  };

  const handleStatus = () => {
     if (!isConnected) {
        triggerAlert({ type: 'error', title: 'OFFLINE', message: 'Neural Link Disconnected.' });
        return;
     }
     
     const statusLine: TerminalLine = { 
       id: Math.random().toString(), 
       type: 'system', 
       content: (
         <div className="p-2 border border-neon-cyan/30 bg-neon-cyan/5 rounded text-xs font-mono space-y-1">
            <div className="font-bold text-neon-cyan mb-2">=== SYSTEM STATUS REPORT ===</div>
            <div>STATUS: <span className="text-matrix-green">ONLINE</span></div>
            <div>USER: {currentUser?.codename || 'UNKNOWN'}</div>
            <div>ADDR: {currentAddress}</div>
            <div>MEMORY SHARDS: {useMemoryStore.getState().logs.length}</div>
            <div>SYNC_RATE: 100%</div>
         </div>
       ) 
     };

     setHistory(prev => [...prev, statusLine]);
  };

  return { handleCommand, handleClear, handleStatus };
}
