import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioCtxRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTone = useCallback((freq, type = 'sine', duration = 0.3, volume = 0.3) => {
    if (!audioCtxRef.current) return;
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playSuccessChime = useCallback(() => {
    playTone(523.25, 'sine', 0.15); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.3), 100); // E5
  }, [playTone]);

  const playFailureBuzzer = useCallback(() => {
    playTone(150, 'sawtooth', 0.4, 0.4); 
    setTimeout(() => playTone(100, 'sawtooth', 0.5, 0.4), 200); 
  }, [playTone]);

  return { initAudio, playTone, playSuccessChime, playFailureBuzzer };
}
