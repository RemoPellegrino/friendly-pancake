import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, makeQuestion, noteLabel } from '../src/music.ts';

test('note indices map to scientific pitch labels', () => {
  assert.equal(noteLabel(28), 'C4');
  assert.equal(noteLabel(30), 'E4');
  assert.equal(noteLabel(18), 'G2');
});
test('each clef respects its inclusive range and natural-note answer', () => {
  for (const clef of ['treble', 'bass'] as const) {
    const settings = { enabled: { treble: clef === 'treble', bass: clef === 'bass' }, ranges: { treble: [28, 39] as [number, number], bass: [16, 28] as [number, number] } };
    for (let i = 0; i < 200; i++) {
      const q = makeQuestion('names', settings);
      assert.equal(q.clef, clef);
      assert.ok(q.note >= settings.ranges[clef][0] && q.note <= settings.ranges[clef][1]);
      assert.equal(q.answer, q.note % 7);
    }
  }
});
test('single-note ranges remain playable', () => {
  const settings = { ...DEFAULT_SETTINGS, ranges: { treble: [28, 28] as [number, number], bass: [18, 18] as [number, number] } };
  const q = makeQuestion('names', settings);
  assert.deepEqual(makeQuestion('names', settings, q), q);
});
test('duration modes cover four values and avoid consecutive duplicates', () => {
  for (const mode of ['lengths', 'rests'] as const) {
    for (let value = 0; value < 4; value++) {
      const previous = { clef: 'treble' as const, note: 34, value, answer: value };
      const q = makeQuestion(mode, DEFAULT_SETTINGS, previous);
      assert.notEqual(q.value, value);
      assert.equal(q.answer, q.value);
      assert.ok(q.value >= 0 && q.value < 4);
    }
  }
});
