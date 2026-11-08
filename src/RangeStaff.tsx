import { useRef, type PointerEvent } from 'react';
import type { Translation } from '../Locale';
import { type Clef, noteLabel } from './music';
import { glyphs } from './glyphs';

const MIN_NOTE = 14;
const MAX_NOTE = 42;

export function RangeStaff({ clef, range, onChange, text }: {
  clef: Clef;
  range: [number, number];
  onChange: (bound: 0 | 1, note: number) => void;
  text: Translation;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ pointer: number; bound: 0 | 1; offset: number } | null>(null);
  const bottomNote = clef === 'treble' ? 30 : 18;
  const noteY = (note: number) => 150 - (note - bottomNote) * 9;
  // Fixed coordinates keep the staff still while either endpoint is dragged.
  const top = Math.min(25, noteY(MAX_NOTE) - 40);
  const height = Math.max(210, noteY(MIN_NOTE) + 60) - top;
  function pointerY(event: PointerEvent<SVGGElement>) {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()).y : null;
  }
  function start(event: PointerEvent<SVGGElement>, bound: 0 | 1) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return;
    const y = pointerY(event);
    if (y === null) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointer: event.pointerId, bound, offset: noteY(range[bound]) - y };
  }
  function move(event: PointerEvent<SVGGElement>) {
    const active = drag.current;
    const y = pointerY(event);
    if (!active || active.pointer !== event.pointerId || y === null) return;
    const note = bottomNote + Math.round((150 - y - active.offset) / 9);
    onChange(active.bound, note);
  }
  function stop(event: PointerEvent<SVGGElement>) {
    if (drag.current?.pointer === event.pointerId) drag.current = null;
  }
  return <div className="rangeStaff">
    <p className="hint rangeInstructions">{text.dragRangeHint}</p>
    <svg ref={svg} className="rangeStaffSvg" viewBox={`0 ${top} 320 ${height}`} role="group" aria-label={`${text.rangeStaffLabel}, ${text[clef]}`}>
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1="18" x2="302" y1={150 - i * 18} y2={150 - i * 18} stroke="#94a3b8" strokeWidth="1.5"/>)}
      <g transform={`translate(28 ${clef === 'treble' ? 132 : 96})`}><path d={glyphs[clef]} fill="#192942"/></g>
      {([0, 1] as const).map(bound => {
        const x = bound === 0 ? 138 : 242;
        const y = noteY(range[bound]);
        const low = bound === 0 ? MIN_NOTE : range[0];
        const high = bound === 0 ? range[1] : MAX_NOTE;
        const name = bound === 0 ? text.lowest : text.highest;
        const ledger: number[] = [];
        for (let line = 168; line <= y; line += 18) ledger.push(line);
        for (let line = 60; line >= y; line -= 18) ledger.push(line);
        return <g key={bound} className={`rangeHandle ${bound === 0 ? 'lowHandle' : 'highHandle'}`} role="slider" tabIndex={0}
          aria-label={`${name}, ${text[clef]}`} aria-orientation="vertical" aria-valuemin={low} aria-valuemax={high}
          aria-valuenow={range[bound]} aria-valuetext={noteLabel(range[bound])}
          onPointerDown={event => start(event, bound)} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}
          onKeyDown={event => {
            const changes: Record<string, number> = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 7, PageDown: -7 };
            if (event.key === 'Home' || event.key === 'End' || event.key in changes) {
              event.preventDefault();
              onChange(bound, event.key === 'Home' ? low : event.key === 'End' ? high : range[bound] + changes[event.key]);
            }
          }}>
          <circle className="rangeHalo" cx={x} cy={y} r="25"/>
          {ledger.map(line => <line key={line} x1={x - 23} x2={x + 23} y1={line} y2={line} stroke="currentColor" strokeWidth="2"/>)}
          <ellipse cx={x} cy={y} rx="12" ry="8" transform={`rotate(-18 ${x} ${y})`} fill="currentColor"/>
          <line x1={x + 11} x2={x + 11} y1={y} y2={y - 38} stroke="currentColor" strokeWidth="2.5"/>
          <text x={x} y={y + 44} textAnchor="middle" className="rangePitchLabel">{noteLabel(range[bound])}</text>
        </g>;
      })}
    </svg>
  </div>;
}
