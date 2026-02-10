import { MIST_PER_SUI } from '@mysten/sui/utils';

export function formatBalance(balance: bigint | number): string {
  const mist = BigInt(balance);
  const sui = Number(mist) / Number(MIST_PER_SUI);
  
  // If < 0.0001, show more precision
  if (sui > 0 && sui < 0.0001) {
    return sui.toExponential(2);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(sui);
}
