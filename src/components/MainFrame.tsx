import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

export interface FrameItem {
  title: string;
  label: string;
  frameAsset: string;
  subtitle: string;
  accent: string;
  anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FrameBox {
  left: number;
  top: number;
  width: number;
  height: number;
  nativeCrop?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

interface MainFrameProps {
  item: FrameItem;
  index: number;
  box: FrameBox;
  isHovered: boolean;
  isLaunching: boolean;
  onHover: (hovering: boolean) => void;
  onClick: () => void;
  onLaunchComplete: () => void;
}

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

export default function MainFrame({
  item,
  box,
  isLaunching,
  onHover,
  onClick,
  onLaunchComplete,
}: MainFrameProps) {
  const fallDistance = Math.max(320, window.innerHeight - box.top - box.height * 0.18);
  const upperDrop = -box.top - box.height * 1.4;
  const finalDrop = window.innerHeight * 0.1 - box.top;

  return (
    <motion.button
      type="button"
      className={isLaunching ? 'frame-hotspot is-launching' : 'frame-hotspot'}
      style={
        {
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          '--frame-accent': item.accent,
        } as CSSProperties
      }
      initial={false}
      animate={
        isLaunching
          ? {
              opacity: [1, 1, 1, 0],
              x: [0, 0, 0, 0],
              y: [0, fallDistance, upperDrop, finalDrop],
              scale: [1, 0.86, 1.48, 2.75],
              rotate: [0, -7, 13, -3],
            }
          : {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0,
            }
      }
      transition={{
        delay: 0,
        duration: isLaunching ? 1.72 : 0.7,
        ease: isLaunching ? [0.76, 0, 0.24, 1] : [0.16, 1, 0.3, 1],
        times: isLaunching ? [0, 0.34, 0.52, 1] : undefined,
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      onAnimationComplete={() => {
        if (isLaunching) onLaunchComplete();
      }}
      aria-label={`打开${item.label}`}
    >
      <div className="frame-breath">
        {box.nativeCrop ? (
          <img
            src={assetUrl('main-bg.png')}
            alt=""
            draggable={false}
            className="frame-native-slice"
            style={box.nativeCrop as CSSProperties}
          />
        ) : (
          <img
            src={assetUrl(item.frameAsset)}
            alt=""
            draggable={false}
            className="frame-slice"
          />
        )}
        <div className="frame-hover-glow" />
      </div>
    </motion.button>
  );
}
