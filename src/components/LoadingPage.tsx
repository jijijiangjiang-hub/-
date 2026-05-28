import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

export default function LoadingPage() {
  const phase = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.pause();
  }, []);

  const startVortex = () => {
    window.setTimeout(() => setPhase('vortex'), 180);
  };

  const handleEnter = async () => {
    const video = videoRef.current;
    setStarted(true);

    if (!video) {
      startVortex();
      return;
    }

    video.currentTime = 0;

    try {
      await video.play();
    } catch {
      startVortex();
    }
  };

  return (
    <AnimatePresence>
      {phase === 'loading' && (
        <motion.div
          key="loading"
          className="loading-page"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <video
            ref={videoRef}
            src={assetUrl('intro-video.mp4')}
            className={started ? 'loading-video is-playing' : 'loading-video'}
            muted
            playsInline
            preload="auto"
            onEnded={startVortex}
          />

          <div className="loading-shade" />

          <AnimatePresence>
            {!started && (
              <motion.section
                className="loading-content"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18, filter: 'blur(12px)' }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.p
                  className="loading-kicker"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 1.1 }}
                >
                  BOBBY'S WORLD
                </motion.p>

                <motion.button
                  type="button"
                  onClick={handleEnter}
                  className="glass-enter"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.95, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2, scale: 1.018 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>点击进入</span>
                </motion.button>
              </motion.section>
            )}
          </AnimatePresence>

          {started && (
            <motion.h1
              className="loading-whisper"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0.25] }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
            >
              OPENING
            </motion.h1>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
