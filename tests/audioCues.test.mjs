import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import {
  MAIN_AUDIO_CUES,
  getMainAudioCue,
  hasPlayableAudioSource,
} from '../src/data/audioCues.ts';

test('main room audio cue is reserved for the vinyl trigger', () => {
  const cue = getMainAudioCue('main-room-memory');

  assert.equal(cue.id, 'main-room-memory');
  assert.equal(cue.trigger, 'main-vinyl');
  assert.equal(cue.vinylAsset, 'vinyl-record.png');
  assert.deepEqual(cue.vinylCenter, { x: 551, y: 583 });
  assert.ok(cue.vinylScale > 1);
  assert.equal(cue.audioFile, 'a-trace-of-grace.mp3');
  assert.equal(cue.startAt, 0);
  assert.equal(hasPlayableAudioSource(cue), true);
});

test('vinyl trigger uses prepared media assets', () => {
  const cue = getMainAudioCue('main-room-memory');
  const vinylPath = new URL(`../public/assets/${cue.vinylAsset}`, import.meta.url);
  const audioPath = new URL(`../public/assets/${cue.audioFile}`, import.meta.url);

  assert.equal(existsSync(vinylPath), true);
  assert.equal(existsSync(audioPath), true);
});

test('main room audio cue registry exposes stable ids for future audio files', () => {
  assert.deepEqual(
    MAIN_AUDIO_CUES.map((cue) => cue.id),
    ['main-room-memory'],
  );
});
