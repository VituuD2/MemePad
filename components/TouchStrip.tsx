import React, { useState, useRef, useEffect } from 'react';

interface TouchStripProps {
  label: string;
  value: number; // 0 to 1 for volume, 0.5 to 2.0 for pitch maybe?
  onChange: (val: number) => void;
  min: number;
  max: number;
  defaultValue: number;
}

export const TouchStrip: React.FC<TouchStripProps> = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max,
  defaultValue 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const height = rect.height;
    const relativeY = clientY - rect.top;
    
    // Invert Y because volume goes Up
    let percentage = 1 - (relativeY / height);
    
    // Clamp
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;

    const newValue = min + (percentage * (max - min));
    onChange(newValue);
  };

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleMove(clientY);
  };

  const onEnd = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch dragging outside
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
        handleMove(clientY);
        e.preventDefault(); // Prevent scrolling on mobile while using strip
      }
    };
    const handleGlobalUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove, { passive: false });
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging, min, max, onChange]);

  // Calculate percentage for rendering
  const fillPercent = ((value - min) / (max - min)) * 100;
  
  // Reset on double click
  const handleDoubleClick = () => {
      onChange(defaultValue);
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full select-none">
      <div 
        ref={containerRef}
        onMouseDown={onStart}
        onTouchStart={onStart}
        onDoubleClick={handleDoubleClick}
        className="relative w-10 md:w-12 h-64 md:h-80 bg-neutral-900 border border-neutral-700 rounded-full overflow-hidden cursor-pointer shadow-inner touch-none"
      >
        {/* Track indicators */}
        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-30">
            {[...Array(9)].map((_, i) => (
                <div key={i} className="w-full h-px bg-neutral-500 mx-auto w-1/2" />
            ))}
        </div>

        {/* The Fill */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-cyan-500 transition-all duration-75 ease-out opacity-80"
          style={{ height: `${fillPercent}%` }}
        />
        
        {/* The Thumb/Handle Effect */}
        <div 
            className="absolute left-0 right-0 h-1 bg-white blur-sm transition-all duration-75"
            style={{ bottom: `${fillPercent}%`, opacity: isDragging ? 1 : 0.5 }}
        />

        {/* Center notch for pitch */}
        {label.includes('Pitch') && (
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 z-10 opacity-50" />
        )}
      </div>
      <span className="text-xs font-mono text-neutral-400 tracking-wider uppercase">{label}</span>
      <span className="text-[10px] font-mono text-neutral-500">
        {label === 'Pitch' ? `${value.toFixed(2)}x` : `${Math.round(value * 100)}%`}
      </span>
    </div>
  );
};