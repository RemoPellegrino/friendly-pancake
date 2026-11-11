export type Clef = 'treble' | 'bass';
export type Mode = 'names' | 'lengths' | 'rests' | 'ear';
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const NOTE_NAMES = ['C - Do', 'D - Re', 'E - Mi', 'F - Fa', 'G - Sol', 'A - La', 'B - Si'];
export const DURATIONS = ['Whole · 4 beats', 'Half · 2 beats', 'Quarter · 1 beat', 'Eighth · ½ beat'];
export const noteLabel = (index: number) => `${LETTERS[index % 7]}${Math.floor(index / 7)}`;
export type Settings = { enabled: Record<Clef, boolean>; ranges: Record<Clef, [number, number]> };
export const DEFAULT_SETTINGS: Settings = { enabled: { treble: true, bass: false }, ranges: { treble: [27, 32], bass: [24, 29] } };
export type Question = { clef: Clef; note: number; value: number; answer: number };
export function makeQuestion(mode: Mode, settings: Settings, previous?: Question): Question {
  const clefs = (['treble', 'bass'] as Clef[]).filter(c => settings.enabled[c]);
  const pool: Question[] = [];
  if (mode === 'names' || mode === 'ear') {
    for (const clef of clefs) {
      const [low, high] = settings.ranges[clef];
      for (let note = low; note <= high; note++) pool.push({ clef, note, value: 2, answer: note % 7 });
    }
  } else {
    for (let value = 0; value < 4; value++) pool.push({ clef: 'treble', note: 34, value, answer: value });
  }
  const alternatives = pool.filter(q => !previous || q.clef !== previous.clef || q.note !== previous.note || q.value !== previous.value);
  const choices = alternatives.length ? alternatives : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

// Natural-note indices use C0 = 0; MIDI uses C4 = 60. A4 is 440 Hz.
export function noteFrequency(index: number): number {
  const semitone = [0, 2, 4, 5, 7, 9, 11][index % 7];
  const midi = (Math.floor(index / 7) + 1) * 12 + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}
