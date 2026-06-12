export type MainAudioTriggerId = 'main-vinyl';

export interface AudioTimeCue {
  id: string;
  label: string;
  at: number;
}

export interface MainAudioCue {
  id: string;
  label: string;
  trigger: MainAudioTriggerId;
  vinylAsset: string;
  vinylCenter: {
    x: number;
    y: number;
  };
  vinylScale: number;
  audioFile?: string;
  startAt: number;
  timeCues: AudioTimeCue[];
}

export const MAIN_AUDIO_CUES: MainAudioCue[] = [
  {
    id: 'main-room-memory',
    label: 'Memory record',
    trigger: 'main-vinyl',
    vinylAsset: 'vinyl-record.png',
    vinylCenter: { x: 551, y: 583 },
    vinylScale: 1.08,
    audioFile: 'a-trace-of-grace.mp3',
    startAt: 0,
    timeCues: [],
  },
];

export function getMainAudioCue(id: string) {
  const cue = MAIN_AUDIO_CUES.find((item) => item.id === id);

  if (!cue) {
    throw new Error(`Unknown main audio cue: ${id}`);
  }

  return cue;
}

export function hasPlayableAudioSource(cue: MainAudioCue) {
  return typeof cue.audioFile === 'string' && cue.audioFile.trim().length > 0;
}
