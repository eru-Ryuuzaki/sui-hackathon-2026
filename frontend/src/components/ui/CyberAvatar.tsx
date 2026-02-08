import { minidenticon } from 'minidenticons';
import { useMemo, useEffect, useState } from 'react';

interface CyberAvatarProps {
  seed: string; // Wallet Address or any string
  size?: number;
  className?: string;
  glitch?: boolean; // Enable glitch effect (rapidly changing seeds)
}

export function CyberAvatar({ seed, size = 64, className = '', glitch = false }: CyberAvatarProps) {
  const [currentSeed, setCurrentSeed] = useState(seed);

  // Glitch Effect Logic
  useEffect(() => {
    if (!glitch) {
      setCurrentSeed(seed);
      return;
    }

    const interval = setInterval(() => {
      // Generate random glitch seed
      setCurrentSeed(Math.random().toString(36).substring(7));
    }, 80); // Rapid flickering

    return () => clearInterval(interval);
  }, [glitch, seed]);

  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(currentSeed, 95, 45)), // 95% saturation, 45% lightness (Neon style)
    [currentSeed]
  );

  return (
    <img 
      src={svgURI} 
      alt={seed} 
      width={size} 
      height={size} 
      className={`bg-void-black/50 rounded-sm border border-titanium-grey/20 p-1 ${className}`}
      style={{
        // Force Cyberpunk Colors via CSS Filters if needed, though minidenticon handles colors well
        // filter: 'drop-shadow(0 0 2px rgba(0, 243, 255, 0.5))'
      }}
    />
  );
}
