import { useEffect, useRef, useState, useCallback } from 'react';
import { SoundConfig } from '../types';

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Store loaded audio buffers: { [filePath]: AudioBuffer }
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  
  // Store active source nodes to allow stopping/looping: { [soundId]: Node[] }
  // We allow both AudioBufferSourceNode (files) and OscillatorNode (fallback)
  const activeSourcesRef = useRef<Map<string, (AudioBufferSourceNode | OscillatorNode)[]>>(new Map());

  const [isInitialized, setIsInitialized] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [pitch, setPitch] = useState(1.0);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  
  // Track which pads have loop mode enabled manually by the user
  const [loopModes, setLoopModes] = useState<Set<string>>(new Set());

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = masterVolume;
    
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64; 

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    audioContextRef.current = ctx;
    masterGainRef.current = masterGain;
    analyserRef.current = analyser;
    
    setIsInitialized(true);
  }, [masterVolume]);

  // Load a sound file
  const loadSound = useCallback(async (sound: SoundConfig) => {
    if (!audioContextRef.current) return;
    if (buffersRef.current.has(sound.filePath)) return; 

    try {
      const response = await fetch(sound.filePath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      buffersRef.current.set(sound.filePath, audioBuffer);
    } catch (error) {
      // Silent fail, we will use fallback if buffer is missing
    }
  }, []);

  // Toggle Loop Mode for a specific pad
  const toggleLoopMode = useCallback((id: string) => {
    setLoopModes(prev => {
      const next = new Set(prev);
      const isLoopingNow = next.has(id);
      
      if (isLoopingNow) {
        // === TURNING LOOP OFF ===
        next.delete(id);
        
        // Fix: Find active sources for this ID and unlatch them
        // This ensures they don't keep looping in the background
        const sources = activeSourcesRef.current.get(id);
        if (sources) {
            sources.forEach(s => {
                if (s instanceof AudioBufferSourceNode) {
                    // Set loop to false so it stops at the end of the current buffer
                    s.loop = false;
                } else if (s instanceof OscillatorNode) {
                    // Fallback synth doesn't have a buffer end, so stop immediately
                    try { s.stop(); } catch(e) {}
                    // Manually clean up visual state for synth
                    setActivePads(p => {
                        const np = new Set(p);
                        np.delete(id);
                        return np;
                    });
                }
            });
        }
      } else {
        // === TURNING LOOP ON ===
        next.add(id);
        
        // Feature: Latch currently playing sounds if loop is toggled ON while playing
        const sources = activeSourcesRef.current.get(id);
        if (sources) {
            sources.forEach(s => {
                if (s instanceof AudioBufferSourceNode) {
                    s.loop = true;
                }
            });
        }
      }
      return next;
    });
  }, []);

  const stopSound = useCallback((soundId: string) => {
    const sources = activeSourcesRef.current.get(soundId);
    if (sources) {
      sources.forEach(s => {
        try { s.stop(); } catch(e) {}
      });
      activeSourcesRef.current.set(soundId, []);
    }
    setActivePads(prev => {
        const next = new Set(prev);
        next.delete(soundId);
        return next;
    });
  }, []);

  // Play a sound
  const playSound = useCallback((sound: SoundConfig) => {
    if (!audioContextRef.current) {
      initAudio();
    }
    const ctx = audioContextRef.current!;
    
    // Ensure context is running (browser policy)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    if (!masterGainRef.current) return;

    // Determine if we should loop based on config OR manual override
    const shouldLoop = sound.loop || loopModes.has(sound.id);

    // If looping is enabled and the sound is already playing, STOP it (toggle behavior)
    if (shouldLoop && activePads.has(sound.id)) {
        stopSound(sound.id);
        return; 
    }

    let buffer = buffersRef.current.get(sound.filePath);
    let source: AudioBufferSourceNode | OscillatorNode;
    
    // Track active pads immediately
    setActivePads(prev => {
        const next = new Set(prev);
        next.add(sound.id);
        return next;
    });

    if (buffer) {
      // === REAL FILE PLAYBACK ===
      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.playbackRate.value = pitch;
      bufferSource.loop = shouldLoop;
      bufferSource.connect(masterGainRef.current);
      bufferSource.start(0);
      source = bufferSource;

      bufferSource.onended = () => {
        // Only remove active state if the loop property is false
        // We check the property on the node itself to handle dynamic unlatching
        if (!bufferSource.loop) {
             setActivePads(prev => {
                const next = new Set(prev);
                const current = activeSourcesRef.current.get(sound.id);
                // Only remove visual active if this was the last/only source
                if (!current || current.length <= 1) {
                    next.delete(sound.id);
                }
                return next;
             });
        }
        // Cleanup source from tracker
        const current = activeSourcesRef.current.get(sound.id);
        if (current) {
            activeSourcesRef.current.set(sound.id, current.filter(s => s !== bufferSource));
        }
      };

    } else {
      // === FALLBACK SYNTH PLAYBACK (If file not found) ===
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(masterGainRef.current);
      
      // Different tones for different pads based on ID hash
      const idVal = sound.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const freq = 100 + (idVal % 800);
      
      osc.type = shouldLoop ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Apply pitch to oscillator (detune)
      // 100 cents = 1 semitone. 1200 cents = 1 octave.
      // pitch 0.5 = -1200 cents, pitch 2.0 = +1200 cents
      const detune = Math.log2(pitch) * 1200;
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      
      if (!shouldLoop) {
          osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.1);
      }
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      if (shouldLoop) {
          // Continuous play
          osc.start();
          // No auto-stop
      } else {
          // One shot
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
          
          // Auto remove visual after short delay
          setTimeout(() => {
            setActivePads(prev => {
                const next = new Set(prev);
                next.delete(sound.id);
                return next;
            });
          }, 200);
      }
      source = osc;
    }

    // Track Source
    const existing = activeSourcesRef.current.get(sound.id) || [];
    activeSourcesRef.current.set(sound.id, [...existing, source]);

  }, [pitch, initAudio, loopModes, activePads, stopSound]);

  const stopAll = useCallback(() => {
    activeSourcesRef.current.forEach((sources, id) => {
      sources.forEach(s => {
        try { s.stop(); } catch(e) {}
      });
      activeSourcesRef.current.set(id, []);
    });
    setActivePads(new Set());
  }, []);

  const updateMasterVolume = useCallback((val: number) => {
    setMasterVolume(val);
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(val, audioContextRef.current?.currentTime || 0, 0.01);
    }
  }, []);

  const updatePitch = useCallback((val: number) => {
    setPitch(val);
    // Real-time pitch shifting for active sources (BufferSources only)
    activeSourcesRef.current.forEach(sources => {
        sources.forEach(s => {
            if (s instanceof AudioBufferSourceNode) {
                s.playbackRate.setTargetAtTime(val, audioContextRef.current?.currentTime || 0, 0.1);
            } else if (s instanceof OscillatorNode) {
               // Update detune for oscillators
               const detune = Math.log2(val) * 1200;
               s.detune.setTargetAtTime(detune, audioContextRef.current?.currentTime || 0, 0.1);
            }
        });
    });
  }, []);

  return {
    initAudio,
    isInitialized,
    playSound,
    stopSound,
    stopAll,
    loadSound,
    masterVolume,
    updateMasterVolume,
    pitch,
    updatePitch,
    activePads,
    analyserNode: analyserRef.current,
    loopModes,
    toggleLoopMode
  };
};