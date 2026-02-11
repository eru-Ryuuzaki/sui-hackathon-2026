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
import { MemoryArchive } from '@/components/ui/MemoryArchive';
import { LogDetails } from '@/components/ui/LogDetails';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, PlusSquare, Trash2, Activity, XCircle, List } from 'lucide-react';
import { IdentityRegistrationModal } from '@/components/IdentityRegistrationModal';

interface TerminalLine {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  content: React.ReactNode;
}

export function Terminal() {
  const account = useCurrentAccount();
  const { currentUser, login, register, updateBirthday } = useUserStore();
  const { addLog, viewingLogId, setViewingLogId } = useMemoryStore();
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
  const [showMatrix, setShowMatrix] = useState(false);

  // Mode State (CLI vs Journal vs Archive vs Detail)
  const [mode, setMode] = useState<'CLI' | 'JOURNAL' | 'ARCHIVE' | 'DETAIL'>('CLI');

  // Watch for viewingLogId to trigger Detail Mode
  useEffect(() => {
    if (viewingLogId) {
        setMode('DETAIL');
    } else if (mode === 'DETAIL') {
        // If viewingLogId cleared while in DETAIL, go back
        setMode('ARCHIVE'); // Default back to Archive as it's most likely source
    }
  }, [viewingLogId]);

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
          setIsRegistering(true); // This now triggers the MODAL, not just the flag
          setHistory(prev => [...prev, { id: Math.random().toString(), type: 'system', content: '> INITIATING IDENTITY PROTOCOL...' }]);
        }
      }
    } else {
      // Logout
      setIsRegistering(false);
      setShowMatrix(false);
    }
  }, [currentAddress]); // React to address changes (including zkLogin)

  // --- Registration Callback ---
  const handleIdentityConfirm = (codename: string, birthday: string) => {
    // IMMEDIATE ACTION: Close Modal First
    setIsRegistering(false);

    // 1. Trigger Matrix Rain (Visual Metaphor for Upload)
    setShowMatrix(true);
    
    // 2. Add System Logs (Scrolling effect)
    const logs = [
      `> CODENAME "${codename.toUpperCase()}" ACCEPTED.`,
      `> ORIGIN DATE: ${birthday}`,
      `> UPLOADING BIOMETRICS TO HIVE MIND...`,
      `> SYNCING MEMORY SHARDS...`,
      `> GENERATING DIGITAL AVATAR HASH...`
    ];

    let delay = 0;
    logs.forEach(log => {
      setTimeout(() => {
        setHistory(prev => [...prev, { id: Math.random().toString(), type: 'system', content: log }]);
      }, delay);
      delay += 800;
    });

    // 3. Finalize Registration after logs
    setTimeout(() => {
      // Update Store
      register(currentAddress!, codename);
      updateBirthday(currentAddress!, birthday);

      // Show Avatar in Terminal
      setHistory(prev => [
        ...prev, 
        { 
          id: Math.random().toString(), 
          type: 'system', 
          content: (
            <div className="flex items-center gap-4 my-2 p-2 border border-neon-cyan bg-neon-cyan/10 rounded shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              <CyberAvatar seed={currentAddress!} size={64} glitch={false} className="border-neon-cyan" />
              <div className="text-xs">
                <div className="text-neon-cyan font-bold">AVATAR GENERATED</div>
                <div className="text-titanium-grey font-mono text-[10px]">{currentAddress!.slice(0, 16)}...</div>
              </div>
            </div>
          ) 
        },
        { id: Math.random().toString(), type: 'success', content: `> WELCOME TO THE VOID, ${codename.toUpperCase()}.` },
        { id: Math.random().toString(), type: 'system', content: `> TYPE 'HELP' TO BEGIN.` }
      ]);
      
      // setIsRegistering(false); // <--- Removed: Already closed at start
      setTimeout(() => setShowMatrix(false), 5000); // Fade out matrix rain
    }, delay + 1000);
  };

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

    // NOTE: Old registration intercept logic removed since we use Modal now

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

      {/* Identity Registration Modal */}
      <IdentityRegistrationModal 
        isOpen={isRegistering}
        onConfirm={handleIdentityConfirm}
        defaultCodename={
          currentUser?.codename || // Prioritize existing
          (account ? `${account.address.slice(0, 4)}...${account.address.slice(-4)}` : '') // New Logic: 0x12...3456
        }
      />

      <main className={cn(
        "lg:col-span-6 flex flex-col h-full min-h-0 transition-all duration-500 perspective-1000",
        isRegistering ? "z-40" : "z-auto" // Reduced Z since Modal is on top
      )}>
        <Card className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-500 relative",
          isRegistering ? "blur-sm scale-95 opacity-50" : "" // Blur background when modal open
        )}>
           {/* Action Bar (Top) */}
           <div className="flex items-center justify-between p-2 border-b border-titanium-grey/20 bg-white/5 shrink-0">
              <div className="flex items-center gap-2">
                 <TerminalIcon size={14} className="text-neon-cyan" />
                 <span className="text-xs text-titanium-grey font-mono">
                   {mode === 'CLI' ? 'TERMINAL_V1.0' : mode === 'JOURNAL' ? 'TRACE_LOGGER_V1.0' : 'MEMORY_ARCHIVE_V1.0'}
                 </span>
              </div>
              <div className="flex gap-2">
                 {mode !== 'CLI' ? (
                   <button 
                     onClick={() => {
                         if (mode === 'DETAIL') setViewingLogId(null); // Clear viewing state
                         setMode('CLI');
                     }}
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
                       onClick={() => isConnected ? setMode('ARCHIVE') : triggerAlert({ type: 'warning', title: 'ACCESS DENIED', message: 'Connect wallet to view archives.' })}
                       className="text-[10px] flex items-center gap-1 px-2 py-1 rounded border border-titanium-grey/30 hover:border-neon-cyan hover:text-neon-cyan transition-colors text-titanium-grey"
                       title="View Memory Archive"
                     >
                       <List size={10} /> LOGS
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
                          !isConnected ? "Connect wallet to start..." : "Enter command..."
                        }
                        disabled={!isConnected || isRegistering} 
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
                        className={isRegistering ? "opacity-50" : ""}
                      />
                      <div className="text-[10px] text-titanium-grey mt-2 flex justify-between px-1">
                         <span>STATUS: {isConnected ? (isRegistering ? 'IDENTIFYING...' : 'LINKED') : 'UNLINKED'}</span>
                         <span>Type 'help' for commands</span>
                      </div>
                   </div>
                 </motion.div>
               ) : mode === 'JOURNAL' ? (
                <motion.div 
                  key="journal"
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-void-black"
                >
                  <JournalEditor 
                    onExit={() => setMode('CLI')} 
                    constructId={currentUser?.constructId} // Pass constructId from currentUser
                  />
                </motion.div>
              ) : mode === 'ARCHIVE' ? (
                 <motion.div 
                   key="archive"
                   initial={{ opacity: 0, rotateY: 90 }}
                   animate={{ opacity: 1, rotateY: 0 }}
                   exit={{ opacity: 0, rotateY: -90 }}
                   transition={{ duration: 0.4 }}
                   className="absolute inset-0 bg-void-black"
                 >
                   <MemoryArchive onExit={() => setMode('CLI')} />
                 </motion.div>
               ) : (
                 <motion.div 
                   key="detail"
                   initial={{ opacity: 0, rotateY: 90 }}
                   animate={{ opacity: 1, rotateY: 0 }}
                   exit={{ opacity: 0, rotateY: -90 }}
                   transition={{ duration: 0.4 }}
                   className="absolute inset-0 bg-void-black"
                 >
                   <LogDetails onExit={() => setViewingLogId(null)} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </Card>
      </main>
    </>
  );
}
