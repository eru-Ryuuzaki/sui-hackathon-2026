import { useState, useEffect } from 'react';

const ASCII_FACES = [
  // 0: Cyber Skull
  `
   ▄▄▄▄▄▄
  █      █
  █  ▀  ▀  █
  █  ▀▀▀▀  █
   ▀▄▄▄▄▀
  `,
  // 1: Robot
  `
   [----]
  /  OO  \\
  |  __  |
  \\______/
  `,
  // 2: Alien
  `
   /\\__\\/\\
  ( o  o )
   )    ( 
  (      )
  `,
  // 3: Ninja
  `
   ▄██▄
  ██▀▀██
  ██████
   ▀██▀
  `,
  // 4: Ghost
  `
    .-.
   (o o)
   | O |
   \\   /
    ^ ^
  `,
  // 5: Hacker
  `
   _____
  | - - |
  |  >  |
  |_____|
  `,
  // 6: Punk
  `
   ! ! !
  ( o o )
   \\ - /
    ---
  `,
  // 7: Glitch
  `
   %&@#*
  < ? ? >
   { ~ }
  [.....]
  `
];

interface AsciiAvatarProps {
  seed: number;
  revealed: boolean;
}

export function AsciiAvatar({ seed, revealed }: AsciiAvatarProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const finalIndex = seed % ASCII_FACES.length;

  useEffect(() => {
    if (revealed) {
      setCurrentFrame(finalIndex);
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % ASCII_FACES.length);
    }, 100);

    return () => clearInterval(interval);
  }, [revealed, finalIndex]);

  return (
    <pre className={`
      font-mono text-xs leading-none select-none
      ${revealed ? 'text-neon-cyan drop-shadow-[0_0_5px_#00f3ff]' : 'text-matrix-green opacity-50'}
      transition-all duration-500
    `}>
      {ASCII_FACES[currentFrame]}
    </pre>
  );
}
