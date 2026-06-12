import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const assetUrl = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

/* Wider transparent work area prevents rotated hands from being clipped. */
const SOURCE_W = 864;
const W = 1200;
const H = 1224;

/* Arm rig data in source-image pixel coordinates */
const RIG = {
  left: {
    shoulder: { x: 104, y: 1157 },
    hand: { x: 276, y: 388 },
  },
  right: {
    shoulder: { x: 708, y: 1157 },
    hand: { x: 608, y: 214 },
  },
} as const;

const COVER = {
  back: { centerX: SOURCE_W / 2, topY: 692, width: 572 },
  leftSocket: { centerX: 256, centerY: 1164, width: 104, rotate: -0.28 },
  rightSocket: { centerX: 610, centerY: 1164, width: 98, rotate: 0.24 },
} as const;

type Side = 'left' | 'right';
type Pt = { x: number; y: number };

function ptAngle(a: Pt, b: Pt) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

export default function MainCharacter() {
  const cvsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const canvas = cvs;
    const ctx = canvas.getContext('2d')!;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const pose: Record<Side, Pt> = {
      left: { x: RIG.left.hand.x, y: RIG.left.hand.y },
      right: { x: RIG.right.hand.x, y: RIG.right.hand.y },
    };

    const images: Record<string, HTMLImageElement> = {};
    let offset = { x: 0, y: 0 };
    let scale = 1;
    let ready = false;
    let ease = 0;

    function toCvs(p: Pt): Pt {
      return { x: offset.x + p.x * scale, y: offset.y + p.y * scale };
    }

    function drawImageLayer(img: HTMLImageElement) {
      ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
    }

    function drawArm(side: Side) {
      const d = RIG[side];
      const shoulder = toCvs(d.shoulder);
      const hand = toCvs(d.hand);
      const tgt = toCvs(pose[side]);
      const srcA = ptAngle(shoulder, hand);
      const tgtA = ptAngle(shoulder, tgt);
      ctx.save();
      ctx.translate(shoulder.x, shoulder.y);
      ctx.rotate(tgtA - srcA);
      ctx.translate(-shoulder.x, -shoulder.y);
      drawImageLayer(images[side]);
      ctx.restore();
    }

    function armActivity(side: Side) {
      const d = RIG[side];
      const sourceAngle = ptAngle(d.shoulder, d.hand);
      const poseAngle = ptAngle(d.shoulder, pose[side]);

      return Math.min(
        1,
        Math.max(0, (Math.abs(angleDelta(poseAngle, sourceAngle)) - 0.08) / 0.34),
      );
    }

    function drawCoverAsset(
      img: HTMLImageElement,
      centerX: number,
      centerY: number,
      sourceWidth: number,
      rotate = 0,
    ) {
      const targetW = sourceWidth * scale;
      const targetH = targetW * (img.naturalHeight / img.naturalWidth);
      const center = toCvs({ x: centerX, y: centerY });

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(rotate);
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    }

    function drawBackCover() {
      const img = images.backCover;
      const targetW = COVER.back.width * scale;
      const targetH = targetW * (img.naturalHeight / img.naturalWidth);
      const x = offset.x + (COVER.back.centerX - COVER.back.width / 2) * scale;
      const y = offset.y + COVER.back.topY * scale;

      ctx.drawImage(img, x, y, targetW, targetH);
    }

    function drawSocketCovers() {
      const leftAlpha = armActivity('left') * 0.52;
      const rightAlpha = armActivity('right') * 0.52;

      ctx.save();
      ctx.globalAlpha = leftAlpha;
      drawCoverAsset(
        images.leftSocket,
        COVER.leftSocket.centerX,
        COVER.leftSocket.centerY,
        COVER.leftSocket.width,
        COVER.leftSocket.rotate,
      );
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = rightAlpha;
      drawCoverAsset(
        images.rightSocket,
        COVER.rightSocket.centerX,
        COVER.rightSocket.centerY,
        COVER.rightSocket.width,
        COVER.rightSocket.rotate,
      );
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      if (!ready) {
        requestAnimationFrame(frame);
        return;
      }

      drawArm('left');
      drawArm('right');
      drawSocketCovers();
      drawBackCover();

      drawImageLayer(images.torso);

      requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      const sourceX = (mx - offset.x) / scale;
      const sourceY = (my - offset.y) / scale;
      const bodyCenterX = offset.x + (SOURCE_W * scale) / 2;
      const side: Side = mx < bodyCenterX ? 'left' : 'right';
      const other: Side = side === 'left' ? 'right' : 'left';

      ease = Math.min(1, ease + 0.08);
      const t = 0.18 + ease * 0.08;
      pose[side].x += (sourceX - pose[side].x) * t;
      pose[side].y += (sourceY - pose[side].y) * t;

      const def = RIG[other].hand;
      pose[other].x += (def.x - pose[other].x) * 0.06;
      pose[other].y += (def.y - pose[other].y) * 0.06;
    }

    function onLeave() {
      ease = 0;
    }

    window.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const srcs: [string, string][] = [
      ['torso', assetUrl('torso-base.png')],
      ['left', assetUrl('hand-left.png')],
      ['right', assetUrl('hand-right.png')],
      ['backCover', assetUrl('character-back-extended.png')],
      ['leftSocket', assetUrl('character-left-shoulder-wedge.png')],
      ['rightSocket', assetUrl('character-right-shoulder-wedge.png')],
    ];

    Promise.all(
      srcs.map(
        ([k, src]) =>
          new Promise<void>((res) => {
            const img = new Image();
            img.onload = () => {
              images[k] = img;
              res();
            };
            img.src = src;
          }),
      ),
    ).then(() => {
      const ref = images.left;
      scale = Math.min(SOURCE_W / ref.naturalWidth, H / ref.naturalHeight);
      const sw = ref.naturalWidth * scale;
      const sh = ref.naturalHeight * scale;
      offset = { x: (W - sw) / 2, y: H - sh };

      ready = true;
    });

    frame();

    return () => {
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <motion.div
      className="main-character"
      style={{ x: '-50%' }}
      animate={{
        rotate: [0, 0.13, -0.08, 0.06, 0],
        scale: [1, 1.005, 1.002, 1.006, 1],
      }}
      transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <canvas ref={cvsRef} style={{ width: '100%', height: '100%' }} />
    </motion.div>
  );
}
