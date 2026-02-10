import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { formatBalance } from '@/utils/formatAmount';
import { RefreshCw, Wallet } from 'lucide-react';

export function WalletBalance() {
  const account = useCurrentAccount();
  
  const { data: balance, isPending, refetch } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
    },
    {
      enabled: !!account,
      refetchInterval: 10000, // Auto-refresh every 10s
    }
  );

  if (!account) return null;

  const rawBalance = balance?.totalBalance ? BigInt(balance.totalBalance) : 0n;
  const formatted = formatBalance(rawBalance); // Assumes you have a utility for SUI formatting

  return (
    <div className="flex items-center gap-2 bg-void-black border border-titanium-grey/30 px-3 py-1 rounded text-xs font-mono group hover:border-neon-cyan/50 transition-colors">
      <Wallet size={12} className="text-titanium-grey group-hover:text-neon-cyan" />
      <span className="text-white tracking-wider">
        {isPending && !balance ? "SCANNING..." : `${formatted} SUI`}
      </span>
      <button 
        onClick={() => refetch()} 
        className="ml-1 text-titanium-grey hover:text-white hover:rotate-180 transition-all duration-500"
        title="Refresh Balance"
      >
        <RefreshCw size={10} />
      </button>
    </div>
  );
}
