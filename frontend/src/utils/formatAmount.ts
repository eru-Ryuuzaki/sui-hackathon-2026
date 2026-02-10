import { MIST_PER_SUI } from '@mysten/sui/utils';

export function formatBalance(balance: bigint | number): string {
  const mist = BigInt(balance);
  const sui = Number(mist) / Number(MIST_PER_SUI);
  
  // High precision mode for small amounts
  if (sui > 0 && sui < 0.0001) {
    return sui.toExponential(4);
  }
  
  // Standard display: up to 4 decimal places, no rounding up if possible
  // Using floor to avoid "fake" extra balance visual
  const factor = 10000;
  const truncated = Math.floor(sui * factor) / factor;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(truncated);
}
