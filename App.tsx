import React, { useState, useEffect } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { SOUND_MAPPING } from './constants';
import { Pad } from './components/Pad';
import { TouchStrip } from './components/TouchStrip';
import { Visualizer } from './components/Visualizer';
import { Power, Square, Repeat } from 'lucide-react';

export default function App() {
  const { 
    initAudio, 
    isInitialized, 
    playSound, 
    stopAll,
    loadSound, 
    activePads, 
    masterVolume, 
    updateMasterVolume, 
    pitch, 
    updatePitch,
    analyserNode,
    loopModes,
    toggleLoopMode
  } = useAudioEngine();

  const [activeBank, setActiveBank] = useState<'A' | 'B'>('A');

  // Preload sounds when bank changes
  useEffect(() => {
    if (isInitialized) {
      SOUND_MAPPING[activeBank].forEach(sound => loadSound(sound));
    }
  }, [activeBank, isInitialized, loadSound]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4 tracking-tighter">
                MEME DECK XP-1
            </h1>
            <p className="text-neutral-400 mb-8 font-mono text-sm">
                Professional Hardware Emulation. <br/>
                Local Assets. Zero Latency.
            </p>
            
            <button 
                onClick={initAudio}
                className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full" />
                <span className="flex items-center justify-center gap-2">
                    <Power size={20} />
                    POWER ON SYSTEM
                </span>
            </button>
            <p className="mt-4 text-xs text-neutral-600">Ensure volume is turned up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex flex-col items-center justify-center p-2 md:p-8 select-none overflow-hidden">
      
      {/* CHASSIS CONTAINER */}
      <div className="w-full max-w-6xl bg-[#161617] rounded-3xl p-4 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] border border-[#262626] relative flex flex-col h-[95vh] md:h-auto">
        
        {/* TOP SECTION: VISUALIZER & META */}
        <div className="flex justify-between items-end mb-6 gap-4 border-b border-neutral-800 pb-4 shrink-0">
            <div className="flex-1 hidden md:block">
               <h1 className="text-xl font-bold tracking-tight text-neutral-300 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 MEME DECK <span className="text-neutral-600 text-sm font-mono">XP-1</span>
               </h1>
            </div>
            
            <div className="flex-1 w-full max-w-md">
                <Visualizer analyserNode={analyserNode} />
            </div>

            <div className="flex-1 flex justify-end gap-2">
                <button 
                    onClick={stopAll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded hover:bg-red-900/50 transition-colors"
                >
                    <Square size={16} fill="currentColor" />
                    <span className="text-xs font-bold">KILL ALL</span>
                </button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 flex-1 min-h-0">
            
            {/* LEFT STRIP: MASTER VOL */}
            <div className="hidden md:flex flex-col h-full max-h-[500px] justify-center">
                <TouchStrip 
                    label="Master Vol" 
                    min={0} 
                    max={1} 
                    defaultValue={0.8}
                    value={masterVolume} 
                    onChange={updateMasterVolume} 
                />
            </div>

            {/* CENTER: PADS */}
            <div className="flex-1 flex flex-col h-full min-h-0">
                
                {/* Bank Selector */}
                <div className="flex gap-2 mb-4 bg-neutral-900/50 p-1 rounded-lg self-center border border-neutral-800 shrink-0">
                    <button 
                        onClick={() => setActiveBank('A')}
                        className={`px-6 py-2 rounded font-mono text-sm font-bold transition-all ${activeBank === 'A' ? 'bg-neutral-700 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        BANK A
                    </button>
                    <button 
                        onClick={() => setActiveBank('B')}
                        className={`px-6 py-2 rounded font-mono text-sm font-bold transition-all ${activeBank === 'B' ? 'bg-neutral-700 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                        BANK B
                    </button>
                </div>

                {/* THE GRID */}
                {/* Removed fixed aspect ratio and height constraints to allow natural filling */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 flex-1 min-h-0 auto-rows-fr">
                    {SOUND_MAPPING[activeBank].map((sound) => (
                        <Pad 
                            key={sound.id}
                            config={sound}
                            isActive={activePads.has(sound.id)}
                            isLoopMode={loopModes.has(sound.id)}
                            onTrigger={playSound}
                            onToggleLoop={toggleLoopMode}
                        />
                    ))}
                </div>

                {/* Mobile Sliders */}
                 <div className="md:hidden flex justify-between mt-4 gap-4 px-4 h-48 shrink-0">
                    <TouchStrip 
                        label="Vol" 
                        min={0} 
                        max={1} 
                        defaultValue={0.8}
                        value={masterVolume} 
                        onChange={updateMasterVolume} 
                    />
                     <TouchStrip 
                        label="Pitch" 
                        min={0.5} 
                        max={1.5} 
                        defaultValue={1.0}
                        value={pitch} 
                        onChange={updatePitch} 
                    />
                </div>
            </div>

             {/* RIGHT STRIP: PITCH */}
             <div className="hidden md:flex flex-col h-full max-h-[500px] justify-center">
                <TouchStrip 
                    label="Pitch Bend" 
                    min={0.5} 
                    max={1.5} 
                    defaultValue={1.0}
                    value={pitch} 
                    onChange={updatePitch} 
                />
            </div>
        </div>

        {/* FOOTER INSTRUCTIONS */}
        <div className="hidden md:flex mt-4 pt-4 border-t border-neutral-800 justify-between text-neutral-600 text-[10px] uppercase font-mono shrink-0">
            <span>Local Asset Mode</span>
            <span>Tip: Click <Repeat size={10} className="inline"/> to toggle loop</span>
            <span>React Audio Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}