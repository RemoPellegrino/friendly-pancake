import { useEffect, useRef, useState } from 'react';
import type { Translation } from '../Locale';

const notes = [{ beats: 1, rest: false }, { beats: 1, rest: true }, { beats: 2, rest: false }];
export function RhythmPractice({ t }: { t: Translation }) {
  const [bpm, setBpm] = useState(80);
  const [click, setClick] = useState(true);
  const [beat, setBeat] = useState(-4);
  const [running, setRunning] = useState(false);
  const [held, setHeld] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const start = useRef(0);
  const presses = useRef<{ start: number; end: number }[]>([]);
  const down = useRef<number | null>(null);
  const seconds = 60 / bpm;
  const position = () => (audio.current!.currentTime - start.current) / seconds;
  function release() {
    if (down.current !== null) {
      presses.current.push({ start: down.current, end: position() });
      down.current = null;
    }
    setHeld(false);
  }
  function press() {
    if (!running || down.current !== null) return;
    down.current = position();
    setHeld(true);
  }
  function stop() {
    setRunning(false); setHeld(false); down.current = null;
    void audio.current?.close(); audio.current = null;
  }
  async function begin() {
    const context = new AudioContext();
    audio.current = context;
    try { await context.resume(); } catch { await context.close(); audio.current = null; return; }
    start.current = context.currentTime + 0.15 + 4 * seconds;
    presses.current = []; down.current = null; setResult(null); setBeat(-4);
    for (let i = -4; i < 4; i++) {
      if (i >= 0 && !click) continue;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const time = start.current + i * seconds;
      oscillator.frequency.value = i % 4 === 0 ? 1000 : 700;
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(time); oscillator.stop(time + 0.05);
    }
    setRunning(true);
  }
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const update = () => {
      const value = (audio.current!.currentTime - start.current) / seconds;
      setBeat(value);
      if (value >= 4) {
        if (down.current !== null) presses.current.push({ start: down.current, end: value });
        const expected = [{ start: 0, end: 1 }, { start: 2, end: 4 }];
        const matches = expected.filter(n => presses.current.some(p => Math.abs(p.start - n.start) <= 0.2 && Math.abs(p.end - n.end) <= 0.2));
        setResult(presses.current.length === 2 ? matches.length : 0);
        setRunning(false); setHeld(false); down.current = null;
        void audio.current?.close(); audio.current = null;
      } else frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [running, seconds]);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => {
    const blur = () => { if (audio.current) stop(); };
    window.addEventListener('blur', blur);
    return () => window.removeEventListener('blur', blur);
  }, []);
  let offset = 0;
  return <section className="card">
    <h2>{t.rhythm}</h2><p>{t.rhythmHelp}</p>
    <label>{t.tempo} <input type="number" min="40" max="200" value={bpm} disabled={running} onChange={e => setBpm(Math.max(40, Math.min(200, Number(e.target.value) || 40)))}/></label>
    <label><input type="checkbox" checked={click} disabled={running} onChange={e => setClick(e.target.checked)}/>{t.metronome}</label>
    <div className="rhythm-sheet" aria-label={t.rhythmSheet}><span>4/4</span>{notes.map((n, i) => {
      const from = offset; offset += n.beats;
      return <span key={i} className={running && beat >= from && beat < offset ? 'rhythm-active' : ''} aria-label={n.rest ? t.rhythmRest : n.beats === 2 ? t.rhythmHalf : t.rhythmQuarter}>{n.rest ? '𝄽' : n.beats === 2 ? '𝅗𝅥' : '♩'}</span>;
    })}</div>
    <label>{t.beatProgress}<progress max="1" value={running ? ((beat % 1) + 1) % 1 : 0}/></label>
    <p aria-live="polite">{running && beat < 0 ? t.countIn : result !== null ? t.rhythmResult.replace('{score}', String(result)) : t.rhythmReady}</p>
    <button type="button" className={`rhythm-pad ${held ? 'rhythm-held' : ''}`} disabled={!running} aria-pressed={held}
      onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); press(); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onKeyDown={e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) press(); } }}
      onKeyUp={e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); release(); } }}
      onBlur={release}>{held ? t.holding : t.rhythmPad}</button>
    <button type="button" className="button selected" onClick={() => running ? stop() : void begin()}>{running ? t.stopRhythm : t.startRhythm}</button>
  </section>;
}
