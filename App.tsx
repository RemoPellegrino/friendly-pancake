import React, { useEffect, useRef, useState } from 'react';
import { browserStorage } from './src/storage';
import './src/styles.css';
import { DEFAULT_LOCALE, locales } from './Locale';
import { type Clef, DEFAULT_SETTINGS, makeQuestion, type Mode, noteLabel, type Settings } from './src/music';
import { Staff } from './src/Staff';

type Score = { correct: number; wrong: number };
type Scores = Record<Mode, Score>;
const emptyScores = (): Scores => ({ names: { correct: 0, wrong: 0 }, lengths: { correct: 0, wrong: 0 }, rests: { correct: 0, wrong: 0 } });
const modes: Mode[] = ['names', 'lengths', 'rests'];
const STORAGE_KEY = 'music-theory-v1';
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isScore = (v: unknown): v is Score => isRecord(v) && typeof v.correct === 'number' && Number.isSafeInteger(v.correct) && v.correct >= 0 && typeof v.wrong === 'number' && Number.isSafeInteger(v.wrong) && v.wrong >= 0;
function validSettings(v: unknown): v is Settings {
  if (!isRecord(v) || !isRecord(v.enabled) || !isRecord(v.ranges)) return false;
  const { enabled, ranges } = v;
  return typeof enabled.treble === 'boolean' && typeof enabled.bass === 'boolean' && (enabled.treble || enabled.bass) &&
    (['treble', 'bass'] as Clef[]).every(c => {
      const range = ranges[c];
      return Array.isArray(range) && range.length === 2 && range.every(n => typeof n === 'number' && Number.isInteger(n) && n >= 14 && n <= 42) && range[0] <= range[1];
    });
}
export default function App() {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<'practice' | 'settings'>(() => new URLSearchParams(location.search).get('page') === 'settings' ? 'settings' : 'practice');
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [mode, setMode] = useState<Mode>('names');
  const [question, setQuestion] = useState(() => makeQuestion('names', DEFAULT_SETTINGS));
  const [answer, setAnswer] = useState<number | null>(null);
  const [storageError, setStorageError] = useState(false);
  const answered = useRef(false);
  const saveQueue = useRef(Promise.resolve());
  const t = locales[locale] ?? locales[DEFAULT_LOCALE];
  useEffect(() => {
    document.documentElement.lang = locale === 'en-UK' ? 'en-GB' : locale;
    document.title = t.appName;
  }, [locale, t.appName]);
  useEffect(() => {
    browserStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      const data = JSON.parse(raw);
      if (locales[data.locale]) setLocale(data.locale);
      if (validSettings(data.settings)) { setSettings(data.settings); setQuestion(makeQuestion('names', data.settings)); }
      if (data.scores && modes.every(m => isScore(data.scores[m]))) setScores(data.scores);
    }).catch(() => setStorageError(true)).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready) return;
    const payload = JSON.stringify({ locale, settings, scores });
    saveQueue.current = saveQueue.current.then(() => browserStorage.setItem(STORAGE_KEY, payload)).then(() => setStorageError(false)).catch(() => setStorageError(true));
  }, [ready, locale, settings, scores]);
  function next(nextMode = mode, nextSettings = settings) {
    answered.current = false; setAnswer(null);
    setQuestion(previous => makeQuestion(nextMode, nextSettings, previous));
  }
  function submit(index: number) {
    if (answered.current) return;
    answered.current = true; setAnswer(index);
    const key = index === question.answer ? 'correct' : 'wrong';
    setScores(previous => ({ ...previous, [mode]: { ...previous[mode], [key]: previous[mode][key] + 1 } }));
  }
  function updateSettings(value: Settings) { setSettings(value); next(mode, value); }
  function changeRange(clef: Clef, bound: 0 | 1, delta: number) {
    const range: [number, number] = [...settings.ranges[clef]];
    range[bound] = Math.max(14, Math.min(42, range[bound] + delta));
    if (range[0] > range[1]) range[bound === 0 ? 1 : 0] = range[bound];
    updateSettings({ ...settings, ranges: { ...settings.ranges, [clef]: range } });
  }
  const choices = mode === 'names' ? t.noteNames : t.durations;
  const score = scores[mode];
  return <main className="content">
    <span className="brand">♫</span><h1 className="title">{t.appName}</h1><span className="subtitle">{t.tagline}</span>
    {!ready ? <span>{t.loading}</span> : <>
      <div className="row">{(['practice', 'settings'] as const).map(p => <Button key={p} title={t[p]} selected={page === p} onPress={() => setPage(p)}/>)}</div>
      {page === 'practice' ? <>
        <div className="row">{modes.map(m => <Button key={m} title={t[m]} selected={mode === m} onPress={() => { setMode(m); next(m); }}/>)}</div>
        <div className="scores"><span className="correct">{t.correct}: {score.correct}</span><span className="wrong">{t.wrong}: {score.wrong}</span></div>
        <div className="card">
          <h2 className="heading">{mode === 'names' ? t.namePrompt : mode === 'lengths' ? t.lengthPrompt : t.restPrompt}</h2>
          <span className="hint">{mode === 'names' ? t[question.clef] : t.timeHint}</span>
          <Staff question={question} mode={mode} label={mode === 'names' ? t.staffLabel : t.durationLabel}/>
          <div className="answers">{choices.map((choice, i) => <button type="button" key={i} disabled={answer !== null} onClick={() => submit(i)} className={`answer ${answer !== null && question.answer === i ? 'rightAnswer' : ''} ${answer === i && i !== question.answer ? 'wrongAnswer' : ''}`}><span className="answerText">{choice}</span></button>)}</div>
          <div aria-live="polite" className="feedback">{answer !== null && <span className={`feedbackText ${answer === question.answer ? 'correct' : 'wrong'}`}>{answer === question.answer ? `${t.correctFeedback} ${choices[question.answer]}` : `${t.wrongFeedback} ${choices[question.answer]}`}</span>}</div>
          {answer !== null && <Button title={t.next} selected onPress={() => next()}/>}
        </div>
        <Button title={t.reset} onPress={() => { setScores(p => ({ ...p, [mode]: { correct: 0, wrong: 0 } })); next(); }}/>
      </> : <div className="card">
        <h2 className="heading">{t.language}</h2>
        <div className="row">{Object.entries(locales).map(([id, text]) => <Button key={id} title={text.languageName} selected={id === locale} onPress={() => setLocale(id)}/>)}</div>
        <h2 className="heading">{t.clefs}</h2><span className="hint">{t.rangeHint}</span>
        {(['treble', 'bass'] as Clef[]).map(c => <div key={c} className="clef">
          <div className="rangeRow"><span className="label">{t[c]}</span><input type="checkbox" role="switch" aria-label={t[c]} checked={settings.enabled[c]} onChange={event => { const enabled = event.target.checked; if (!enabled && !settings.enabled[c === 'treble' ? 'bass' : 'treble']) return; updateSettings({ ...settings, enabled: { ...settings.enabled, [c]: enabled } }); }}/></div>
          {([0, 1] as const).map(bound => <div className="rangeRow" key={bound}><span className="hint">{bound === 0 ? t.lowest : t.highest}</span><div className="stepper"><Button title="−" label={`${t.decrease} ${bound === 0 ? t.lowest : t.highest}, ${t[c]}`} onPress={() => changeRange(c, bound, -1)}/><span className="note">{noteLabel(settings.ranges[c][bound])}</span><Button title="+" label={`${t.increase} ${bound === 0 ? t.lowest : t.highest}, ${t[c]}`} onPress={() => changeRange(c, bound, 1)}/></div></div>)}
        </div>)}
        <span className="hint">{t.savedHint}</span>
      </div>}
      {storageError && <span aria-live="polite" className="wrong">{t.storageError}</span>}
    </>}
  </main>;
}
function Button({ title, onPress, selected, label }: { title: string; onPress: () => void; selected?: boolean; label?: string }) {
  return <button type="button" aria-label={label ?? title} aria-pressed={selected} onClick={onPress} className={`button ${selected ? 'selected' : ''}`}>{title}</button>;
}
