import { useEffect, useRef, useState } from 'react';
import type { Translation } from '../Locale';
import { noteFrequency } from './music';

export function EarTone({ note, t, onHeard }: { note: number; t: Translation; onHeard: () => void }) {
  const audio = useRef<AudioContext | null>(null);
  const active = useRef<OscillatorNode | null>(null);
  const busy = useRef(false);
  const [played, setPlayed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => () => {
    active.current?.stop();
    active.current = null;
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }, []);

  async function play() {
    if (busy.current) return;
    busy.current = true;
    setError(false);
    try {
      const context = audio.current ?? new AudioContext();
      audio.current = context;
      await context.resume();
      if (audio.current !== context) return;
      if (context.state !== 'running') throw new Error('Audio unavailable');
      active.current?.stop();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.value = noteFrequency(note);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.setValueAtTime(0.2, start + 0.75);
      gain.gain.linearRampToValueAtTime(0, start + 1);
      oscillator.connect(gain);
      gain.connect(context.destination);
      active.current = oscillator;
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        if (active.current === oscillator) active.current = null;
      };
      oscillator.start(start);
      oscillator.stop(start + 1.02);
      setPlayed(true);
      onHeard();
    } catch {
      setError(true);
    } finally {
      busy.current = false;
    }
  }

  return <>
    <button type="button" className="button selected" onClick={() => void play()}>{played ? t.replayTone : t.playTone}</button>
    {error && <p role="alert" className="wrong">{t.audioError}</p>}
  </>;
}
