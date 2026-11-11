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

import { noteFrequency } from '../src/music.ts';

test('ear training uses enabled clefs and inclusive configured ranges', () => {
  for (const clef of ['treble', 'bass'] as const) {
    for (const note of [14, 28, 33, 42]) {
      const settings = { enabled: { treble: clef === 'treble', bass: clef === 'bass' }, ranges: { treble: [note, note] as [number, number], bass: [note, note] as [number, number] } };
      const q = makeQuestion('ear', settings);
      assert.equal(q.note, note);
      assert.equal(q.clef, clef);
      assert.equal(q.answer, note % 7);
      assert.deepEqual(makeQuestion('ear', settings, q), q);
    }
  }
});

test('ear training avoids repeating the previous note when alternatives exist', () => {
  let q = makeQuestion('ear', DEFAULT_SETTINGS);
  for (let i = 0; i < 100; i++) {
    const next = makeQuestion('ear', DEFAULT_SETTINGS, q);
    assert.notEqual(next.note, q.note);
    q = next;
  }
});

test('natural-note audio pitches use concert tuning and octave doubling', () => {
  assert.equal(noteFrequency(33), 440);
  assert.ok(Math.abs(noteFrequency(28) - 261.625565) < 0.000001);
  for (let note = 14; note <= 35; note++) {
    assert.ok(noteFrequency(note + 1) > noteFrequency(note));
    assert.ok(Math.abs(noteFrequency(note + 7) - noteFrequency(note) * 2) < 1e-9);
  }
});
