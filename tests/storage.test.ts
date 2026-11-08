import { test } from 'node:test';
import assert from 'node:assert/strict';
import { browserStorage } from '../src/storage.ts';

test('browser storage reads the existing progress key and persists updates', async () => {
  const values = new Map([['music-theory-v1', '{"locale":"nl-BE","scores":{"names":{"correct":8,"wrong":2}}}']]);
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  } });
  try {
    const previous = JSON.parse((await browserStorage.getItem('music-theory-v1'))!);
    assert.equal(previous.scores.names.correct, 8);
    previous.scores.names.correct++;
    await browserStorage.setItem('music-theory-v1', JSON.stringify(previous));
    assert.equal(JSON.parse(values.get('music-theory-v1')!).scores.names.correct, 9);
    assert.equal(await browserStorage.getItem('missing'), null);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
