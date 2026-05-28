import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function MainCharacter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const leftArmRef = useRef<HTMLImageElement>(null);
  const rightArmRef = useRef<HTMLImageElement>(null);
  const mouseRef = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.34 });

  useEffect(() => {
    const stage = stageRef.current;
    const leftArm = leftArmRef.current;
    const rightArm = rightArmRef.current;
    if (!stage || !leftArm || !rightArm) return;

    const aimArms = () => {
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const useLeft = mouseRef.current.x < centerX;

      const leftOrigin = {
        x: rect.left + rect.width * 0.12,
        y: rect.top + rect.height * 0.965,
      };
      const rightOrigin = {
        x: rect.left + rect.width * 0.82,
        y: rect.top + rect.height * 0.965,
      };

      const leftAngle = Math.atan2(mouseRef.current.y - leftOrigin.y, mouseRef.current.x - leftOrigin.x) * (180 / Math.PI);
      const rightAngle = Math.atan2(mouseRef.current.y - rightOrigin.y, mouseRef.current.x - rightOrigin.x) * (180 / Math.PI);

      gsap.to(leftArm, {
        rotation: useLeft ? clamp(leftAngle + 82, -42, 58) : 0,
        transformOrigin: '12% 96.5%',
        duration: 0.46,
        ease: 'power3.out',
      });

      gsap.to(rightArm, {
        rotation: useLeft ? 0 : clamp(rightAngle + 100, -58, 42),
        transformOrigin: '82% 96.5%',
        duration: 0.46,
        ease: 'power3.out',
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      aimArms();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', aimArms);
    aimArms();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', aimArms);
    };
  }, []);

  return (
    <motion.div
      ref={stageRef}
      className="main-character"
      style={{ x: '-50%' }}
      animate={{
        rotate: [0, 0.13, -0.08, 0.06, 0],
        scale: [1, 1.005, 1.002, 1.006, 1],
      }}
      transition={{
        duration: 7.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        ref={leftArmRef}
        src={assetUrl('hand-left.png')}
        alt=""
        draggable={false}
        className="character-arm character-arm-left"
      />
      <img
        ref={rightArmRef}
        src={assetUrl('hand-right.png')}
        alt=""
        draggable={false}
        className="character-arm character-arm-right"
      />
      <img
        src={assetUrl('torso-base.png')}
        alt=""
        draggable={false}
        className="character-torso"
      />
    </motion.div>
  );
}
