import { useSuiClient, useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCallback, useState } from 'react';
import axios from 'axios';
import { Buffer } from 'buffer'; // Add Buffer import

interface UseSponsoredTransactionResult {
  executeSponsoredTx: (tx: Transaction) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export function useSponsoredTransaction(): UseSponsoredTransactionResult {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSponsoredTx = useCallback(async (tx: Transaction) => {
    if (!account) {
        throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
        // 1. Serialize Transaction (without Gas Payment)
        tx.setSender(account.address);
        // We MUST NOT set gasBudget or gasPayment here yet, backend will do it.
        
        // Build to bytes for sending to backend
        const txBytes = await tx.build({ client });
        const txBytesBase64 = Buffer.from(txBytes).toString('base64');

        // 2. Request Sponsorship
        const response = await axios.post('/api/gas/sponsor', {
            txBytes: txBytesBase64,
            sender: account.address
        });
        
        const { txBytes: sponsoredTxBytesBase64, sponsorSignature } = response.data;
        const sponsoredTxBytes = Buffer.from(sponsoredTxBytesBase64, 'base64');
        const sponsoredTx = Transaction.from(sponsoredTxBytes);

        // 3. User Signs
        const { signature: userSignature } = await signTransaction({
            transaction: sponsoredTx,
        });

        // 4. Submit Dual Signed Transaction
        const result = await client.executeTransactionBlock({
            transactionBlock: sponsoredTxBytes,
            signature: [userSignature, sponsorSignature],
            options: {
                showEffects: true,
                showEvents: true
            }
        });

        return result;

    } catch (e: any) {
        console.error('Sponsored Tx Failed:', e);
        setError(e.message || 'Transaction failed');
        throw e;
    } finally {
        setIsLoading(false);
    }
  }, [account, client, signTransaction]);

  return { executeSponsoredTx, isLoading, error };
}