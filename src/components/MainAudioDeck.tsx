import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { gsap } from 'gsap';
import { getMainAudioCue, hasPlayableAudioSource } from '../data/audioCues';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const IMAGE_SIZE = { width: 1796, height: 876 };
const VINYL_BOUNDS = { x: 449, y: 474, width: 236, height: 236 };
const AUDIO_TRIGGER_LABEL = '\u89e6\u53d1\u4e3b\u754c\u9762\u97f3\u9891';

interface SceneRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MainAudioDeckProps {
  sceneRect: SceneRect;
  isEnabled: boolean;
}

export default function MainAudioDeck({ sceneRect, isEnabled }: MainAudioDeckProps) {
  const deckRef = useRef<HTMLButtonElement>(null);
  const vinylRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const firedTimeCues = useRef(new Set<string>());
  const [isSpinning, setIsSpinning] = useState(false);

  const cue = getMainAudioCue('main-room-memory');
  const deckStyle = useMemo(() => {
    const scaleX = sceneRect.width / IMAGE_SIZE.width;
    const scaleY = sceneRect.height / IMAGE_SIZE.height;

    return {
      left: sceneRect.left + VINYL_BOUNDS.x * scaleX,
      top: sceneRect.top + VINYL_BOUNDS.y * scaleY,
      width: VINYL_BOUNDS.width * scaleX,
      height: VINYL_BOUNDS.height * scaleY,
      '--audio-core-x': `${((cue.vinylCenter.x - VINYL_BOUNDS.x) / VINYL_BOUNDS.width) * 100}%`,
      '--audio-core-y': `${((cue.vinylCenter.y - VINYL_BOUNDS.y) / VINYL_BOUNDS.height) * 100}%`,
    } as CSSProperties;
  }, [cue.vinylCenter.x, cue.vinylCenter.y, sceneRect]);

  const recordLayerStyle = useMemo(() => {
    const scaleX = sceneRect.width / IMAGE_SIZE.width;
    const scaleY = sceneRect.height / IMAGE_SIZE.height;

    return {
      left: -VINYL_BOUNDS.x * scaleX,
      top: -VINYL_BOUNDS.y * scaleY,
      width: sceneRect.width,
      height: sceneRect.height,
      transformOrigin: `${cue.vinylCenter.x * scaleX}px ${cue.vinylCenter.y * scaleY}px`,
    } as CSSProperties;
  }, [cue.vinylCenter.x, cue.vinylCenter.y, sceneRect]);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return undefined;

    const ctx = gsap.context(() => {
      gsap.from(deck, {
        autoAlpha: 0,
        scale: 0.88,
        duration: 1.1,
        delay: 0.85,
        ease: 'power3.out',
      });
    }, deck);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const vinyl = vinylRef.current;
    if (!vinyl) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.set(vinyl, {
        transformOrigin: recordLayerStyle.transformOrigin,
        scale: cue.vinylScale,
      });

      gsap.to(vinyl, {
        rotation: isSpinning && !reduceMotion ? '+=360' : 0,
        scale: cue.vinylScale,
        duration: isSpinning && !reduceMotion ? 2.65 : 0.5,
        ease: isSpinning && !reduceMotion ? 'none' : 'power2.out',
        repeat: isSpinning && !reduceMotion ? -1 : 0,
      });
    }, deckRef);

    return () => ctx.revert();
  }, [cue.vinylScale, isSpinning, recordLayerStyle.transformOrigin]);

  const togglePlayback = async () => {
    if (!isEnabled) return;

    const audio = audioRef.current;

    if (isSpinning) {
      audio?.pause();
      setIsSpinning(false);
      return;
    }

    firedTimeCues.current.clear();

    if (!hasPlayableAudioSource(cue) || !audio || !cue.audioFile) {
      setIsSpinning(true);
      return;
    }

    setIsSpinning(true);
    audio.src = assetUrl(cue.audioFile);
    audio.currentTime = cue.startAt;

    try {
      await audio.play();
    } catch (error) {
      console.error('Main audio playback failed', error);
      setIsSpinning(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    cue.timeCues.forEach((timeCue) => {
      if (audio.currentTime < timeCue.at || firedTimeCues.current.has(timeCue.id)) return;

      firedTimeCues.current.add(timeCue.id);
      window.dispatchEvent(
        new CustomEvent('bobby:audio-time-cue', {
          detail: {
            audioCueId: cue.id,
            timeCue,
          },
        }),
      );
    });
  };

  return (
    <>
      <button
        ref={deckRef}
        type="button"
        className={[
          'main-audio-deck',
          isSpinning ? 'is-spinning' : '',
          isEnabled ? '' : 'is-disabled',
        ].filter(Boolean).join(' ')}
        style={deckStyle}
        onClick={togglePlayback}
        disabled={!isEnabled}
        aria-label={AUDIO_TRIGGER_LABEL}
        aria-pressed={isSpinning}
      >
        <span ref={vinylRef} className="vinyl-record-layer" aria-hidden="true" style={recordLayerStyle}>
          <img src={assetUrl(cue.vinylAsset)} alt="" draggable={false} />
        </span>
        <span className="audio-trigger-core" aria-hidden="true">
          <span className={isSpinning ? 'audio-pause-icon' : 'audio-play-icon'} />
        </span>
      </button>
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => setIsSpinning(false)}
        onTimeUpdate={handleTimeUpdate}
      />
    </>
  );
}
