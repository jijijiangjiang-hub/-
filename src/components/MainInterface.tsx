import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import MainFrame from './MainFrame';
import MainCharacter from './MainCharacter';
import type { FrameBox, FrameItem } from './MainFrame';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const IMAGE_SIZE = { width: 1796, height: 876 };

const FRAME_ITEMS: FrameItem[] = [
  {
    title: 'I',
    label: '我的学业',
    subtitle: '我的学业',
    anchor: { x: 0.155, y: 0.1, width: 0.181, height: 0.418 },
    accent: '#9c542e',
  },
  {
    title: 'II',
    label: '工作履历',
    subtitle: '工作履历',
    anchor: { x: 0.335, y: 0.1, width: 0.181, height: 0.418 },
    accent: '#2d6170',
  },
  {
    title: 'III',
    label: '兴趣爱好',
    subtitle: '兴趣爱好',
    anchor: { x: 0.499, y: 0.1, width: 0.181, height: 0.418 },
    accent: '#bc8b2f',
  },
  {
    title: 'IV',
    label: '社交平台',
    subtitle: '社交平台',
    anchor: { x: 0.666, y: 0.1, width: 0.181, height: 0.418 },
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
  const maxWidth = viewport.width * (isMobile ? 1 : 0.92);
  const maxHeight = viewport.height * (isMobile ? 0.9 : 0.86);
  const width = Math.min(maxWidth, maxHeight * imageAspect);
  const height = width / imageAspect;
  const topSpace = isMobile ? Math.max(28, (viewport.height - height) * 0.22) : Math.max(72, (viewport.height - height) * 0.48);

  return {
    left: (viewport.width - width) / 2,
    top: topSpace,
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
