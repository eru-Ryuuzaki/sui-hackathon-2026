import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { cn } from '@/utils/cn';

import { MatrixRain } from '@/components/ui/MatrixRain';
import { AsciiAvatar } from '@/components/ui/AsciiAvatar';

interface TerminalLine {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  content: React.ReactNode;
}

export function Terminal() {
  const account = useCurrentAccount();
  const { currentUser, login, register } = useUserStore();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { id: 'init', type: 'system', content: 'Welcome to ENGRAM. The On-Chain Memory Terminal.' },
    { id: 'init2', type: 'system', content: 'Connect your wallet to begin engraving.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Login Flow State
  const [isRegistering, setIsRegistering] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(0);
  const [avatarRevealed, setAvatarRevealed] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on register mode
  useEffect(() => {
    if (isRegistering) {
      inputRef.current?.focus();
    }
  }, [isRegistering]);

  // Handle Wallet Connection & Login
  useEffect(() => {
    if (account) {
      const exists = login(account.address);
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

          setHistory(prev => []); // Clear history for focus

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
  }, [account]);

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
    if (isRegistering && account) {
       const codename = cmd.trim();
       // Basic validation
       if (codename.length < 2 || codename.length > 20) {
          setTimeout(() => {
            setHistory(prev => [...prev, { id: Math.random().toString(), type: 'error', content: '> ERROR: CODENAME MUST BE 2-20 CHARS.' }]);
          }, 200);
          return;
       }

       // Start Avatar Generation Sequence
       const seed = account.address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
       setAvatarSeed(seed);
       setHistory(prev => [...prev, { id: Math.random().toString(), type: 'success', content: `> CODENAME "${codename.toUpperCase()}" ACCEPTED.` }]);
       
       setTimeout(() => {
          setHistory(prev => [...prev, { 
            id: Math.random().toString(), 
            type: 'system', 
            content: (
              <div className="flex items-center gap-4 my-2 p-2 border border-titanium-grey/30 bg-white/5 rounded">
                <AsciiAvatar seed={seed} revealed={false} />
                <div className="text-xs">
                  <div>GENERATING DIGITAL AVATAR...</div>
                  <div className="text-titanium-grey animate-pulse">PROCESSING HASH: {account.address.slice(0,10)}...</div>
                </div>
              </div>
            ) 
          }]);
       }, 500);

       // Reveal Avatar & Complete
       setTimeout(() => {
          setAvatarRevealed(true);
          setShowMatrix(true); // Trigger Matrix Rain
          register(account.address, codename);
          
          setHistory(prev => {
            // Replace the loading avatar with revealed one
            const newHistory = [...prev];
            const lastIdx = newHistory.length - 1;
            newHistory[lastIdx] = {
              id: Math.random().toString(), 
              type: 'system', 
              content: (
                <div className="flex items-center gap-4 my-2 p-2 border border-neon-cyan bg-neon-cyan/10 rounded shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <AsciiAvatar seed={seed} revealed={true} />
                  <div className="text-xs">
                    <div className="text-neon-cyan font-bold">AVATAR GENERATED</div>
                    <div className="text-titanium-grey">ID: #{seed % 8}</div>
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
                <div className="pl-4 text-neon-cyan">engrave &lt;message&gt; - Record a memory shard</div>
                <div className="pl-4 text-neon-cyan">clear             - Clear terminal history</div>
                <div className="pl-4 text-neon-cyan">status            - Check construct status</div>
                <div className="pl-4 text-neon-cyan">whoami            - Show current subject info</div>
                <div className="pl-4 text-neon-cyan">help              - Show this message</div>
              </div>
            )
          };
          break;
        
        case 'clear':
          setHistory([]);
          return;
        
        case 'whoami':
           if (!account || !currentUser) {
             response = { id: Math.random().toString(), type: 'error', content: 'You are an unidentified signal. Please connect.' };
           } else {
             response = { id: Math.random().toString(), type: 'system', content: `> SUBJECT: ${currentUser.codename} (ADDR: ${account.address.slice(0,6)}...)` };
           }
           break;

        case 'engrave':
          if (!account) {
             response = { id: Math.random().toString(), type: 'error', content: 'ERROR: Neural Link Disconnected. Please connect wallet first.' };
          } else if (args.length < 2) {
             response = { id: Math.random().toString(), type: 'error', content: 'Usage: engrave <your memory here>' };
          } else {
             // TODO: Call Contract here
             response = { 
               id: Math.random().toString(), 
               type: 'success', 
               content: `[MOCK] Memory Shard engraved successfully. Hash: 0x${Math.random().toString(16).slice(2,10)}` 
             };
          }
          break;

        case 'status':
           if (!account) {
             response = { id: Math.random().toString(), type: 'error', content: 'Offline.' };
           } else {
             response = { id: Math.random().toString(), type: 'system', content: `Construct Active. Owner: ${account.address}` };
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

  return (
    <>
      {/* Matrix Rain Background */}
      {showMatrix && <MatrixRain />}

      {/* Focus Mode Overlay */}
      {isRegistering && (
        <div className="fixed inset-0 bg-void-black/80 backdrop-blur-sm z-40 transition-all duration-1000" />
      )}

      <main className={cn(
        "lg:col-span-6 flex flex-col h-full min-h-0 transition-all duration-500",
        isRegistering ? "z-50 scale-105" : "z-auto"
      )}>
        <Card className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-500",
          isRegistering ? "border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.2)]" : ""
        )}>
           <div className="flex-1 overflow-y-auto mb-4 p-2 font-mono text-sm scrollbar-thin space-y-2">
              {history.map((line) => (
                <div key={line.id} className={`${
                  line.type === 'user' ? 'text-white' : 
                  line.type === 'error' ? 'text-glitch-red' :
                  line.type === 'success' ? 'text-matrix-green' :
                  'text-titanium-grey'
                }`}>
                  {line.type === 'user' && <span className="text-neon-cyan mr-2">&gt;</span>}
                  {line.content}
                </div>
              ))}
              <div ref={bottomRef} />
           </div>
           
           <div className={cn(
             "border-t pt-4 mt-auto bg-void-black/50 backdrop-blur-sm transition-colors duration-300",
             isRegistering ? "border-neon-cyan/50" : "border-titanium-grey"
           )}>
              <Input 
                ref={inputRef}
                value={command} 
                onChange={(e) => setCommand(e.target.value)} 
                placeholder={
                  !account ? "Connect wallet to start..." : 
                  isRegistering ? (bootSequence >= 5 ? "Enter codename..." : "Initializing...") : "Enter command..."
                }
                disabled={(!account && command !== 'help' && command !== 'clear') || (isRegistering && bootSequence < 5)} 
                prefixText={
                   !account ? "guest@engram:~$" :
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
                 <span>STATUS: {account ? (isRegistering ? 'IDENTIFYING...' : 'LINKED') : 'UNLINKED'}</span>
                 <span>Type 'help' for commands</span>
              </div>
           </div>
        </Card>
      </main>
    </>
  );
}
