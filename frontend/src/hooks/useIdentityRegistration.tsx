import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useUserStore } from '@/hooks/useUserStore';
import { buildJackInTx } from '@/utils/sui/transactions';
import type { TerminalLine } from '@/types/terminal';
import { CyberAvatar } from '@/components/ui/CyberAvatar';
import React from 'react';

interface UseIdentityRegistrationProps {
    setHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
    setShowMatrix: (show: boolean) => void;
    currentAddress?: string | null;
}

export function useIdentityRegistration({
    setHistory,
    setShowMatrix,
    currentAddress
}: UseIdentityRegistrationProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const client = useSuiClient();
    const { register, updateBirthday } = useUserStore();

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
        setTimeout(async () => {
          let constructId: string | undefined;

          try {
             setHistory(prev => [...prev, { id: Math.random().toString(), type: 'system', content: `> INITIATING NEURAL LINK (JACK_IN)... PLEASE APPROVE.` }]);
              
              let result;

             // Direct execution (Self-funded)
             const tx = buildJackInTx();
             const txResult = await signAndExecuteTransaction({ 
                 transaction: tx,
             });

             // Fetch full details to get events
             result = await client.waitForTransaction({
                 digest: txResult.digest,
                 options: { showEvents: true }
             });
             
             // Parse Result for Construct ID
             if (result && result.events) {
                 const jackInEvent = result.events.find((e: any) => e.type.includes("SubjectJackedInEvent"));
                 if (jackInEvent && jackInEvent.parsedJson) {
                     constructId = (jackInEvent.parsedJson as any).construct_id;
                 }
             }

             if (constructId) {
                 setHistory(prev => [...prev, { id: Math.random().toString(), type: 'success', content: `> NEURAL LINK ESTABLISHED. CONSTRUCT ID: ${constructId ? constructId.slice(0,8) : 'UNKNOWN'}...` }]);
             } else {
                 setHistory(prev => [...prev, { id: Math.random().toString(), type: 'error', content: `> WARNING: COULD NOT VERIFY CONSTRUCT ID. USING SIMULATION MODE.` }]);
             }

          } catch (e) {
             console.error("Jack In Failed", e);
             setHistory(prev => [...prev, { id: Math.random().toString(), type: 'error', content: `> NEURAL LINK FAILED. OFFLINE MODE ACTIVATED.` }]);
          }

          // Update Store
          if (currentAddress) {
              register(currentAddress, codename, constructId);
              updateBirthday(currentAddress, birthday);

              // Show Avatar in Terminal
              setHistory(prev => [
                ...prev, 
                { 
                  id: Math.random().toString(), 
                  type: 'system', 
                  content: (
                    <div className="flex items-center gap-4 my-2 p-2 border border-neon-cyan bg-neon-cyan/10 rounded shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                      <CyberAvatar seed={currentAddress} size={64} glitch={false} className="border-neon-cyan" />
                      <div className="text-xs">
                        <div className="text-neon-cyan font-bold">AVATAR GENERATED</div>
                        <div className="text-titanium-grey font-mono text-[10px]">{currentAddress.slice(0, 16)}...</div>
                      </div>
                    </div>
                  ) 
                },
                { id: Math.random().toString(), type: 'success', content: `> WELCOME TO THE VOID, ${codename.toUpperCase()}.` },
                { id: Math.random().toString(), type: 'system', content: `> TYPE 'HELP' TO BEGIN.` }
              ]);
          }
          
          setTimeout(() => setShowMatrix(false), 5000); // Fade out matrix rain
        }, delay + 1000);
    };

    return {
        isRegistering,
        setIsRegistering,
        handleIdentityConfirm
    };
}
