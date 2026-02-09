import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { cn } from '@/utils/cn';
import { triggerAlert } from '@/components/ui/SystemAlert';

import { MatrixRain } from '@/components/ui/MatrixRain';
import { CyberAvatar } from '@/components/ui/CyberAvatar';
import { JournalEditor } from '@/components/ui/JournalEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, PlusSquare, Trash2, Activity, XCircle } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  content: React.ReactNode;
}

export function Terminal() {
  const account = useCurrentAccount();
  const { currentUser, login, register } = useUserStore();
  const { addLog } = useMemoryStore();
  const [command, setCommand] = useState('');
  
  // Effective connection state (Wallet OR zkLogin)
  const isConnected = !!account || !!currentUser;
  const currentAddress = account?.address || currentUser?.address;

  const [history, setHistory] = useState<TerminalLine[]> ([
    { id: 'init', type: 'system', content: 'Welcome to ENGRAM. The On-Chain Memory Terminal.' },
    { id: 'init2', type: 'system', content: 'Connect your wallet to begin engraving.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Login Flow State
  const [isRegistering, setIsRegistering] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);

  // Mode State (CLI vs Journal)
  const [mode, setMode] = useState<'CLI' | 'JOURNAL'>('CLI');

  useEffect(() => {
    if (mode === 'CLI') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, mode]);

  // Focus input on register mode
  useEffect(() => {
    if (isRegistering && mode === 'CLI') {
      inputRef.current?.focus();
    }
  }, [isRegistering, mode]);

  // Handle Wallet Connection & Login
  useEffect(() => {
    if (currentAddress) {
      const exists = login(currentAddress);
      if (exists) {
        // Known User
        if (!history.some(l => l.content === `> SUBJECT IDENTIFIED: ${currentUser?.codename}`)) {
           setHistory(prev => [
             ...prev, 
             { id: Math.random().toString(), type: 'success', content: `> SUBJECT IDENTIFIED: ${currentUser?.codename}` },
             { id: Math.random().toString(), type: 'system', content: `> ACCESS GRANTED. WELCOME BACK.` }
           ]);
        }
      } else {
        // New User -> Start Registration Flow
        if (!isRegistering) {
          setIsRegistering(true);
          // Play Boot Sequence
          let step = 0;
          const sequence = [
            { text: '> INITIALIZING NEURAL LINK PROTOCOL...', delay: 800 },
            { text: '> DETECTING UNREGISTERED CONSCIOUSNESS...', delay: 1600 },
            { text: '> INITIATING IDENTITY VERIFICATION...', delay: 2400 },
            { text: <br/>, delay: 2500 },
            { text: '> PROTOCOL 101: IDENTIFY YOURSELF.', delay: 3000 },
            { text: '> PLEASE ENTER YOUR CODENAME:', delay: 3500 }
          ];

          setHistory([]); // Clear history for focus

          sequence.forEach(({ text, delay }) => {
            setTimeout(() => {
               setHistory(prev => [...prev, { id: Math.random().toString(), type: 'system', content: text }]);
               step++;
               setBootSequence(step);
            }, delay);
          });
        }
      }
    } else {
      // Logout
      setIsRegistering(false);
      setBootSequence(0);
      setShowMatrix(false);
    }
  }, [currentAddress]); // React to address changes (including zkLogin)

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

    // INTERCEPT COMMAND FOR REGISTRATION
    if (isRegistering && currentAddress) {
       const codename = cmd.trim();
       // Basic validation
       if (codename.length < 2 || codename.length > 20) {
          setTimeout(() => {
            setHistory(prev => [...prev, { id: Math.random().toString(), type: 'error', content: '> ERROR: CODENAME MUST BE 2-20 CHARS.' }]);
            triggerAlert({
              type: 'error',
              title: 'IDENTITY REJECTED',
              message: 'Codename format invalid. Length requirements: 2-20 characters.'
            });
          }, 200);
          return;
       }

       // Start Avatar Generation Sequence
       const seed = currentAddress;
       setHistory(prev => [...prev, { id: Math.random().toString(), type: 'success', content: `> CODENAME "${codename.toUpperCase()}" ACCEPTED.` }]);
       
       setTimeout(() => {
          setHistory(prev => [...prev, { 
            id: Math.random().toString(), 
            type: 'system', 
            content: (
              <div className="flex items-center gap-4 my-2 p-2 border border-titanium-grey/30 bg-white/5 rounded">
                <CyberAvatar seed={seed} size={48} glitch={true} />
                <div className="text-xs">
                  <div>GENERATING DIGITAL AVATAR...</div>
                  <div className="text-titanium-grey animate-pulse">PROCESSING HASH: {currentAddress.slice(0,10)}...</div>
                </div>
              </div>
            ) 
          }]);
       }, 500);

       // Reveal Avatar & Complete
       setTimeout(() => {
          setShowMatrix(true); // Trigger Matrix Rain
          register(currentAddress, codename);
          
          setHistory(prev => {
            // Replace the loading avatar with revealed one
            const newHistory = [...prev];
            const lastIdx = newHistory.length - 1;
            newHistory[lastIdx] = {
              id: Math.random().toString(), 
              type: 'system', 
              content: (
                <div className="flex items-center gap-4 my-2 p-2 border border-neon-cyan bg-neon-cyan/10 rounded shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <CyberAvatar seed={seed} size={64} glitch={false} className="border-neon-cyan" />
                  <div className="text-xs">
                    <div className="text-neon-cyan font-bold">AVATAR GENERATED</div>
                    <div className="text-titanium-grey font-mono text-[10px]">{seed.slice(0, 16)}...</div>
                  </div>
                </div>
              ) 
            };
            return newHistory;
          });

          setTimeout(() => {
             setHistory(prev => [
               ...prev,
               { id: Math.random().toString(), type: 'success', content: `> WELCOME TO THE VOID, ${codename.toUpperCase()}.` },
               { id: Math.random().toString(), type: 'system', content: `> TYPE 'HELP' TO BEGIN.` }
             ]);
             setIsRegistering(false);
             // Matrix rain stays for a bit then fades out (controlled by CSS opacity or unmount)
             setTimeout(() => setShowMatrix(false), 5000);
          }, 800);

       }, 2500);
       return;
    }

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
                <div className="pl-4 text-neon-cyan">reroll            - Regenerate avatar (legacy)</div>
                <div className="pl-4 text-neon-cyan">help              - Show this message</div>
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
     
     const statusLine = { 
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
     } as TerminalLine;

     setHistory(prev => [...prev, statusLine]);
  };

  return (
    <>
      {/* Matrix Rain Background */}
      {showMatrix && <MatrixRain />}

      {/* Focus Mode Overlay */}
      {isRegistering && (
        <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-40 transition-all duration-1000" />
      )}

      <main className={cn(
        "lg:col-span-6 flex flex-col h-full min-h-0 transition-all duration-500 perspective-1000",
        isRegistering ? "z-50 scale-105" : "z-auto"
      )}>
        <Card className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-500 relative",
          isRegistering ? "border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.2)]" : ""
        )}>
           {/* Action Bar (Top) */}
           <div className="flex items-center justify-between p-2 border-b border-titanium-grey/20 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                 <TerminalIcon size={14} className="text-neon-cyan" />
                 <span className="text-xs text-titanium-grey font-mono">
                   {mode === 'CLI' ? 'TERMINAL_V1.0' : 'TRACE_LOGGER_V1.0'}
                 </span>
              </div>
              <div className="flex gap-2">
                 {mode === 'JOURNAL' ? (
                   <button 
                     onClick={() => setMode('CLI')}
                     className="text-[10px] flex items-center gap-1 px-2 py-1 rounded border border-glitch-red/50 text-glitch-red hover:bg-glitch-red/10 transition-colors"
                   >
                     <XCircle size={10} /> CANCEL
                   </button>
                 ) : (
                   <>
                     <button 
                       onClick={() => isConnected ? setMode('JOURNAL') : triggerAlert({ type: 'warning', title: 'ACCESS DENIED', message: 'Connect wallet to log trace.' })}
                       className="text-[10px] flex items-center gap-1 px-2 py-1 rounded border border-titanium-grey/30 hover:border-neon-cyan hover:text-neon-cyan transition-colors text-titanium-grey"
                       title="New Log Entry"
                     >
                       <PlusSquare size={10} /> NEW_LOG
                     </button>
                     <button 
                       onClick={handleStatus}
                       className="text-[10px] flex items-center gap-1 px-2 py-1 rounded border border-titanium-grey/30 hover:border-neon-cyan hover:text-neon-cyan transition-colors text-titanium-grey"
                     >
                       <Activity size={10} /> STATUS
                     </button>
                     <button 
                       onClick={handleClear}
                       className="text-[10px] flex items-center gap-1 px-2 py-1 rounded border border-titanium-grey/30 hover:border-neon-cyan hover:text-neon-cyan transition-colors text-titanium-grey"
                     >
                       <Trash2 size={10} /> CLEAR
                     </button>
                   </>
                 )}
              </div>
           </div>

           {/* Content Area with Flip Animation */}
           <div className="flex-1 relative overflow-hidden">
             <AnimatePresence mode="wait">
               {mode === 'CLI' ? (
                 <motion.div 
                   key="cli"
                   initial={{ opacity: 0, rotateY: -90 }}
                   animate={{ opacity: 1, rotateY: 0 }}
                   exit={{ opacity: 0, rotateY: 90 }}
                   transition={{ duration: 0.4 }}
                   className="absolute inset-0 flex flex-col"
                 >
                   <div className="flex-1 overflow-y-auto p-2 font-mono text-sm scrollbar-thin space-y-2">
                      {history.map((line) => (
                        <div key={line.id} className={`${
                          line.type === 'user' ? 'text-white' : 
                          line.type === 'error' ? 'text-glitch-red' :
                          line.type === 'success' ? 'text-matrix-green' :
                          'text-neon-cyan/70'
                        }`}>
                          {line.type === 'user' && <span className="text-neon-cyan mr-2">&gt;</span>}
                          {line.content}
                        </div>
                      ))}
                      <div ref={bottomRef} />
                   </div>
                   
                   <div className={cn(
                     "border-t pt-4 mt-auto bg-void-black/50 backdrop-blur-sm transition-colors duration-300 p-2",
                     isRegistering ? "border-neon-cyan/50" : "border-titanium-grey"
                   )}>
                      <Input 
                        ref={inputRef}
                        value={command} 
                        onChange={(e) => setCommand(e.target.value)} 
                        placeholder={
                          !isConnected ? "Connect wallet to start..." : 
                          isRegistering ? (bootSequence >= 5 ? "Enter codename..." : "Initializing...") : "Enter command..."
                        }
                        disabled={(!isConnected && command !== 'help' && command !== 'clear') || (isRegistering && bootSequence < 5)} 
                        prefixText={
                           !isConnected ? "guest@engram:~$" :
                           isRegistering ? "identity@protocol:~$" :
                           `${currentUser?.codename || 'user'}@engram:~$`
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCommand(command);
                          }
                        }}
                        autoFocus
                        className={isRegistering ? "h-12 text-lg" : ""}
                      />
                      <div className="text-[10px] text-titanium-grey mt-2 flex justify-between px-1">
                         <span>STATUS: {isConnected ? (isRegistering ? 'IDENTIFYING...' : 'LINKED') : 'UNLINKED'}</span>
                         <span>Type 'help' for commands</span>
                      </div>
                   </div>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="journal"
                   initial={{ opacity: 0, rotateY: 90 }}
                   animate={{ opacity: 1, rotateY: 0 }}
                   exit={{ opacity: 0, rotateY: -90 }}
                   transition={{ duration: 0.4 }}
                   className="absolute inset-0 bg-void-black"
                 >
                   <JournalEditor onExit={() => setMode('CLI')} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </Card>
      </main>
    </>
  );
}
