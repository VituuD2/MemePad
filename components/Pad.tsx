import React from 'react';
import { motion } from 'framer-motion';
import { SoundConfig } from '../types';
import { Repeat } from 'lucide-react';

interface PadProps {
  config: SoundConfig;
  isActive: boolean;
  isLoopMode: boolean;
  onTrigger: (config: SoundConfig) => void;
  onToggleLoop: (id: string) => void;
}

const colorMap = {
  blue: '0, 100, 255',
  purple: '180, 0, 255',
  cyan: '0, 255, 230',
  magenta: '255, 0, 180',
  green: '0, 255, 80',
  red: '255, 50, 50',
};

export const Pad: React.FC<PadProps> = ({ config, isActive, isLoopMode, onTrigger, onToggleLoop }) => {
  const rgb = colorMap[config.color];

  // Mouse/Touch handlers
  const handlePress = (e: React.SyntheticEvent) => {
    e.preventDefault(); 
    onTrigger(config);
  };

  const handleLoopToggle = (e: React.PointerEvent) => {
    e.stopPropagation(); // Critical: Don't trigger sound
    e.preventDefault();
    onToggleLoop(config.id);
  };

  // Determine actual loop status (either config-forced or user-toggled)
  const isLoopingEffective = config.loop || isLoopMode;

  return (
    <motion.div
      className="relative w-full h-full min-h-[90px] rounded-lg flex flex-col items-center justify-center overflow-hidden touch-none select-none group cursor-pointer"
      style={{
        backgroundColor: isActive ? `rgba(${rgb}, 0.2)` : '#262626', // Zinc-800
        boxShadow: isActive 
          ? `inset 0 0 20px rgba(${rgb}, 0.5), 0 0 10px rgba(${rgb}, 0.3)` 
          : 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        border: `1px solid ${isActive ? `rgba(${rgb}, 0.8)` : '#3f3f46'}`, // Zinc-700
      }}
      whileTap={{ scale: 0.98 }}
      onPointerDown={handlePress}
    >
      {/* LED Glow Center */}
      <div 
        className="absolute w-full h-full opacity-10 transition-opacity duration-100"
        style={{
            backgroundColor: isActive ? `rgb(${rgb})` : 'transparent',
            opacity: isActive ? 0.3 : 0
        }}
      />
      
      {/* Main Label */}
      <span className={`z-10 text-sm md:text-base font-bold uppercase tracking-wider text-center px-2 transition-all duration-100 ${isActive ? 'text-white scale-105' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
        {config.label}
      </span>

      {/* Loop Toggle Button */}
      <div 
        onPointerDown={handleLoopToggle}
        className={`absolute top-1 right-1 p-2 rounded-md transition-all z-20 hover:bg-white/10 active:bg-white/20 ${isLoopingEffective ? 'text-white' : 'text-neutral-600'}`}
      >
        <Repeat size={14} strokeWidth={isLoopingEffective ? 3 : 2} className={isLoopingEffective ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''} />
      </div>

      {/* Active Loop Indicator (Bottom Strip) */}
      {isActive && isLoopingEffective && (
         <motion.div 
            layoutId={`loop-${config.id}`}
            className="absolute bottom-0 left-0 right-0 h-1 bg-white shadow-[0_0_10px_white]" 
         />
      )}
      
      {/* Decorative corners for "Technical" look */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-600 rounded-tl-sm opacity-50" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neutral-600 rounded-br-sm opacity-50" />

    </motion.div>
  );
};