import { useEffect, useRef } from 'react';

interface NeuralOscilloscopeProps {
  intensity?: number; // 0-100, amplitude of the pulse
  mood?: 'calm' | 'alert' | 'creative'; // Determines color/shape
  isActive?: boolean; // Whether a pulse is currently happening
  color?: string; // Optional hex override for precise color matching
}

export function NeuralOscilloscope({ intensity = 50, mood = 'calm', isActive = false, color }: NeuralOscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const amplitudeRef = useRef(0); // Current animated amplitude

  // Color Mapping
  const getColors = () => {
    if (color) {
        return { stroke: color, shadow: color };
    }
    switch(mood) {
      case 'alert': return { stroke: '#ff003c', shadow: '#ff003c' }; // Glitch Red
      case 'creative': return { stroke: '#bc13fe', shadow: '#bc13fe' }; // Neon Purple
      case 'calm': default: return { stroke: '#00f3ff', shadow: '#00f3ff' }; // Neon Cyan
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
        const parent = canvas.parentElement;
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      timeRef.current += 0.05;
      
      // Target amplitude logic
      // If active, target is intensity. If not, target is base hum (2-5).
      const targetAmp = isActive ? intensity : 2;
      // Smoothly interpolate current amplitude to target
      amplitudeRef.current += (targetAmp - amplitudeRef.current) * 0.1;

      // Clear
      ctx.fillStyle = '#050505'; // Void black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid (Retro Scope Background)
      ctx.strokeStyle = '#8a8a8a20'; // Titanium grey very low opacity
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Draw vertical grid lines
      for(let x=0; x < canvas.width; x+=20) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
      }
      // Draw horizontal grid lines
      for(let y=0; y < canvas.height; y+=20) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // Main Wave
      const colors = getColors();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.shadow;
      
      ctx.beginPath();
      const centerY = canvas.height / 2;
      
      for (let x = 0; x < canvas.width; x++) {
        // Base Sine Wave
        let y = centerY;
        
        // Dynamic Wave Calculation
        // Frequency varies slightly with amplitude for effect
        const freq = 0.05 + (amplitudeRef.current * 0.001); 
        
        // Main component
        const noise = Math.sin(x * freq + timeRef.current * 5);
        
        // Secondary harmonic for complexity
        const harmonic = Math.cos(x * (freq * 2.5) - timeRef.current * 2) * 0.5;
        
        // Glitch factor (add randomness if mood is alert)
        let glitch = 0;
        if(mood === 'alert' && amplitudeRef.current > 10) {
            if(Math.random() > 0.9) glitch = (Math.random() - 0.5) * amplitudeRef.current;
        }

        y += (noise + harmonic) * amplitudeRef.current + glitch;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Scan line (moving right)
      const scanX = (timeRef.current * 100) % canvas.width;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.1;
      ctx.fillRect(scanX, 0, 2, canvas.height);
      ctx.globalAlpha = 1.0;

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [intensity, mood, isActive, color]);

  return (
    <div className="w-full h-24 bg-void-black border-b border-titanium-grey/20 relative overflow-hidden">
      <canvas ref={canvasRef} className="block" />
      {/* Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
    </div>
  );
}