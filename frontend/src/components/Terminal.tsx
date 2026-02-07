import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface TerminalLine {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  content: React.ReactNode;
}

export function Terminal() {
  const account = useCurrentAccount();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { id: 'init', type: 'system', content: 'Welcome to ENGRAM. The On-Chain Memory Terminal.' },
    { id: 'init2', type: 'system', content: 'Connect your wallet to begin engraving.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

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

    // Process Command
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
                <div className="pl-4 text-neon-cyan">help              - Show this message</div>
              </div>
            )
          };
          break;
        
        case 'clear':
          setHistory([]);
          return;

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
    }, 300); // Simulate processing delay
  };

  return (
    <main className="lg:col-span-6 flex flex-col h-[600px] lg:h-auto">
      <Card className="flex-1 flex flex-col h-full overflow-hidden">
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
         
         <div className="border-t border-titanium-grey pt-4 mt-auto bg-void-black/50 backdrop-blur-sm">
            <Input 
              value={command} 
              onChange={(e) => setCommand(e.target.value)} 
              placeholder={account ? "Enter command..." : "Connect wallet to start..."}
              disabled={!account && command !== 'help' && command !== 'clear'} // Allow basic commands even if offline? Maybe just help.
              prefixText={account ? "subject@engram:~$" : "guest@engram:~$"}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCommand(command);
                }
              }}
              autoFocus
            />
            <div className="text-[10px] text-titanium-grey mt-2 flex justify-between px-1">
               <span>STATUS: {account ? 'LINKED' : 'UNLINKED'}</span>
               <span>Type 'help' for commands</span>
            </div>
         </div>
      </Card>
    </main>
  );
}
