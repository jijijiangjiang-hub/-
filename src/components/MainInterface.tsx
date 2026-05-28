import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import MainFrame from './MainFrame';
import MainCharacter from './MainCharacter';
import type { FrameBox, FrameItem } from './MainFrame';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const IMAGE_SIZE = { width: 1796, height: 876 };
const FRAME_SIZE = { width: 0.166, height: 0.404 };

const FRAME_ITEMS: FrameItem[] = [
  {
    title: 'I',
    label: '\u6211\u7684\u5b66\u4e1a',
    frameAsset: 'frame-slice-study.png',
    subtitle: '\u6211\u7684\u5b66\u4e1a',
    anchor: { x: 0.157, y: 0.101, ...FRAME_SIZE },
    accent: '#9c542e',
  },
  {
    title: 'II',
    label: '\u6211\u7684\u5c65\u5386',
    frameAsset: 'frame-slice-career.png',
    subtitle: '\u6211\u7684\u5c65\u5386',
    anchor: { x: 0.335, y: 0.101, ...FRAME_SIZE },
    accent: '#2d6170',
  },
  {
    title: 'III',
    label: '\u65e5\u5e38\u751f\u6d3b',
    frameAsset: 'frame-slice-life.png',
    subtitle: '\u65e5\u5e38\u751f\u6d3b',
    anchor: { x: 0.498, y: 0.101, ...FRAME_SIZE },
    accent: '#bc8b2f',
  },
  {
    title: 'IV',
    label: '\u793e\u4ea4\u53ca\u9879\u76ee',
    frameAsset: 'frame-slice-social.png',
    subtitle: '\u793e\u4ea4\u53ca\u9879\u76ee',
    anchor: { x: 0.658, y: 0.101, ...FRAME_SIZE },
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
  };
}

function getFrameBox(item: FrameItem, viewport: { width: number; height: number }, index: number): FrameBox {
  if (viewport.width < 760) {
    const gap = 14;
    const width = Math.min(136, (viewport.width - 54 - gap) / 2);
    const height = width * (1152 / 923);
    const column = index % 2;
    const row = Math.floor(index / 2);
    const left = (viewport.width - width * 2 - gap) / 2 + column * (width + gap);
    const top = Math.max(64, viewport.height * 0.08) + row * (height + 16);

    return { left, top, width, height };
  }

  const rect = getSceneRect(viewport);

  return {
    left: rect.left + item.anchor.x * rect.width,
    top: rect.top + item.anchor.y * rect.height,
    width: item.anchor.width * rect.width,
    height: item.anchor.height * rect.height,
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

          <MainCharacter />

          <AnimatePresence>
            {activeFrame !== null && (
              <DetailPage item={FRAME_ITEMS[activeFrame]} onClose={() => setActiveFrame(null)} />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailPage({ item, onClose }: { item: FrameItem; onClose: () => void }) {
  return (
    <motion.section
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      style={{ '--detail-accent': item.accent } as CSSProperties}
    >
      <img src={assetUrl('main-bg.png')} alt="" className="detail-bg" draggable={false} />
      <div className="detail-scrim" />

      <button type="button" className="detail-back" onClick={onClose}>
        返回
      </button>

      <motion.div
        className="detail-copy"
        initial={{ y: 36, opacity: 0, filter: 'blur(10px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: 24, opacity: 0, filter: 'blur(10px)' }}
        transition={{ delay: 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="detail-number">{item.title}</p>
        <h2>{item.subtitle}</h2>
        <p>
          这里先放入这一栏目的叙事骨架。下一步你给我具体素材或文字后，我会把它整理成完整的个人页面内容。
        </p>
      </motion.div>
    </motion.section>
  );
}
