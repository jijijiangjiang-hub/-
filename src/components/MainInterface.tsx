import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import MainFrame from './MainFrame';
import MainAudioDeck from './MainAudioDeck';
import StudyDetailPage from './StudyDetailPage';
import type { FrameBox, FrameItem } from './MainFrame';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const IMAGE_SIZE = { width: 1796, height: 876 };

const FRAME_ITEMS: FrameItem[] = [
  {
    title: 'I',
    label: '\u6211\u7684\u5b66\u4e1a',
    frameAsset: 'main-frame-study.png',
    subtitle: '\u6211\u7684\u5b66\u4e1a',
    frameBounds: { x: 283, y: 85, width: 299, height: 358 },
    accent: '#9c542e',
  },
  {
    title: 'II',
    label: '\u6211\u7684\u5c65\u5386',
    frameAsset: 'main-frame-career.png',
    subtitle: '\u6211\u7684\u5c65\u5386',
    frameBounds: { x: 596, y: 88, width: 284, height: 356 },
    accent: '#2d6170',
  },
  {
    title: 'III',
    label: '\u65e5\u5e38\u751f\u6d3b',
    frameAsset: 'main-frame-life.png',
    subtitle: '\u65e5\u5e38\u751f\u6d3b',
    frameBounds: { x: 890, y: 89, width: 279, height: 357 },
    accent: '#bc8b2f',
  },
  {
    title: 'IV',
    label: '\u793e\u4ea4\u53ca\u9879\u76ee',
    frameAsset: 'main-frame-social.png',
    subtitle: '\u793e\u4ea4\u53ca\u9879\u76ee',
    frameBounds: { x: 1167, y: 90, width: 285, height: 358 },
    accent: '#5c4f7c',
  },
];

function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return viewport;
}

function getSceneRect(viewport: { width: number; height: number }) {
  const imageAspect = IMAGE_SIZE.width / IMAGE_SIZE.height;
  const isMobile = viewport.width < 760;
  const rightCropPoint = isMobile ? 0.9 : 0.86;
  const width = Math.ceil(Math.max(viewport.height * imageAspect, viewport.width / rightCropPoint));
  const height = width / imageAspect;
  const left = Math.min(0, viewport.width - width * rightCropPoint);

  return {
    left,
    top: (viewport.height - height) / 2,
    width,
    height,
    right: 'auto',
    bottom: 'auto',
  };
}

function getFrameImageRect(item: FrameItem, width: number, height: number) {
  const scaleX = width / item.frameBounds.width;
  const scaleY = height / item.frameBounds.height;

  return {
    left: -item.frameBounds.x * scaleX,
    top: -item.frameBounds.y * scaleY,
    width: IMAGE_SIZE.width * scaleX,
    height: IMAGE_SIZE.height * scaleY,
  };
}

function getFrameBox(item: FrameItem, viewport: { width: number; height: number }, index: number): FrameBox {
  if (viewport.width < 760) {
    const gap = 14;
    const width = Math.min(136, (viewport.width - 54 - gap) / 2);
    const height = width * (item.frameBounds.height / item.frameBounds.width);
    const column = index % 2;
    const row = Math.floor(index / 2);
    const left = (viewport.width - width * 2 - gap) / 2 + column * (width + gap);
    const top = Math.max(64, viewport.height * 0.08) + row * (height + 16);

    return { left, top, width, height, imageRect: getFrameImageRect(item, width, height) };
  }

  const rect = getSceneRect(viewport);
  const scaleX = rect.width / IMAGE_SIZE.width;
  const scaleY = rect.height / IMAGE_SIZE.height;
  const left = rect.left + item.frameBounds.x * scaleX;
  const top = rect.top + item.frameBounds.y * scaleY;
  const width = item.frameBounds.width * scaleX;
  const height = item.frameBounds.height * scaleY;

  return {
    left,
    top,
    width,
    height,
    imageRect: getFrameImageRect(item, width, height),
  };
}

export default function MainInterface() {
  const phase = useAppStore((s) => s.phase);
  const viewport = useViewport();
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);
  const [activeFrame, setActiveFrame] = useState<number | null>(null);
  const [launchingFrame, setLaunchingFrame] = useState<number | null>(null);

  const sceneRect = useMemo(() => getSceneRect(viewport), [viewport]);
  const frameBoxes = useMemo(
    () => FRAME_ITEMS.map((item, index) => getFrameBox(item, viewport, index)),
    [viewport],
  );

  const handleFrameLaunch = (index: number) => {
    if (launchingFrame !== null || activeFrame !== null) return;
    setHoveredFrame(null);
    setLaunchingFrame(index);
  };

  return (
    <AnimatePresence>
      {(phase === 'reveal' || phase === 'main') && (
        <motion.div
          key="main-interface"
          className="main-interface"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            filter: phase === 'reveal' ? 'blur(12px)' : 'blur(0px)',
          }}
          transition={{ duration: phase === 'main' ? 1.7 : 0.4, ease: 'easeOut' }}
        >
          <img
            src={assetUrl('main-bg.png')}
            alt=""
            className="main-bg"
            style={sceneRect}
            draggable={false}
          />
          <div className="main-vignette" />
          <MainAudioDeck sceneRect={sceneRect} isEnabled={phase === 'main'} />

          <motion.div
            className="site-mark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            BOBBY'S WORLD
          </motion.div>

          {FRAME_ITEMS.map((item, index) => (
            <MainFrame
              key={item.title}
              item={item}
              index={index}
              box={frameBoxes[index]}
              isHovered={hoveredFrame === index}
              isLaunching={launchingFrame === index}
              onHover={(hovering) => setHoveredFrame(hovering ? index : null)}
              onClick={() => handleFrameLaunch(index)}
              onLaunchComplete={() => {
                setLaunchingFrame(null);
                setActiveFrame(index);
              }}
            />
          ))}

          <AnimatePresence>
            {activeFrame !== null && (
              <StudyDetailPage
                key={FRAME_ITEMS[activeFrame].label}
                item={FRAME_ITEMS[activeFrame]}
                onClose={() => setActiveFrame(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
