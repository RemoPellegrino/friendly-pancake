import React from 'react';
import type { Question, Mode } from './music';
import { glyphs } from './glyphs';

export function Staff({ question: q, mode, label }: { question: Question; mode: Mode; label: string }) {
  const bottom = 150;
  const y = bottom - (q.note - (q.clef === 'treble' ? 30 : 18)) * 9;
  const ledger: number[] = [];
  for (let line = bottom + 18; line <= y; line += 18) ledger.push(line);
  for (let line = bottom - 90; line >= y; line -= 18) ledger.push(line);
  const down = y < 114;
  const rests = [glyphs.restWhole, glyphs.restHalf, glyphs.restQuarter, glyphs.restEighth];
  const top = Math.min(-5, y - 25);
  const height = Math.max(275, y + 80) - top;
  return <svg width="100%" height={240} viewBox={`0 ${top} 320 ${height}`} role="img" aria-label={label}>
    {[0, 1, 2, 3, 4].map(i => <line key={i} x1="24" x2="296" y1={bottom - i * 18} y2={bottom - i * 18} stroke="#64748b" strokeWidth="1.5" />)}
    <g transform={`translate(38 ${q.clef === 'treble' ? 132 : 96})`}><path d={glyphs[q.clef]} fill="#192942"/></g>
    {mode === 'rests' ? <g transform={`translate(166 ${q.value === 0 ? 96 : 114})`}><path d={rests[q.value]} fill="#192942"/></g> : <>
      {ledger.map(line => <line key={line} x1="156" x2="198" y1={line} y2={line} stroke="#192942" strokeWidth="2"/>)}
      <ellipse cx="177" cy={y} rx={q.value === 0 ? 15 : 12} ry="8" transform={`rotate(-18 177 ${y})`} fill={q.value < 2 ? '#fff' : '#192942'} stroke="#192942" strokeWidth="3"/>
      {q.value > 0 && <line x1={down ? 166 : 188} x2={down ? 166 : 188} y1={y} y2={down ? y + 58 : y - 58} stroke="#192942" strokeWidth="3"/>}
      {q.value === 3 && <path d={down ? `M166 ${y + 58} Q140 ${y + 39} 163 ${y + 23}` : `M188 ${y - 58} Q216 ${y - 39} 191 ${y - 23}`} fill="none" stroke="#192942" strokeWidth="6"/>}
    </>}
  </svg>;
}
