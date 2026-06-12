import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;
const PAINT_COLORS = ['#7b2f20', '#b45f2a', '#c08a34', '#1d1a14', '#e2c276'];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLImageElement>(null);
  const splatterLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const splatterLayer = splatterLayerRef.current;
    if (!cursor) return;

    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display = 'none';
      return;
    }

    let rafId = 0;
    const target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    const current = { ...target };
    const previous = { ...target };
    const lastSplatPoint = { x: target.x, y: target.y, time: performance.now() };
    const splatters = new Set<HTMLSpanElement>();
    let lastSplatTime = 0;

    const removeOldestSplatter = () => {
      const oldest = splatters.values().next().value;
      if (!oldest) return;

      gsap.killTweensOf(oldest);
      oldest.remove();
      splatters.delete(oldest);
    };

    const emitPaintSplatter = (x: number, y: number, speed: number) => {
      const now = performance.now();
      const detailOpen = Boolean(document.querySelector('.detail-page'));
      const mainOpen = Boolean(document.querySelector('.main-interface'));
      if (!splatterLayer || detailOpen || !mainOpen || now - lastSplatTime < 42) return;
      if (speed < 0.34 && now - lastSplatTime < 150) return;

      lastSplatTime = now;

      const dropCount = speed > 0.7 ? 3 : 2;

      for (let index = 0; index < dropCount; index += 1) {
        while (splatters.size > 44) removeOldestSplatter();

        const splat = document.createElement('span');
        const isPrimaryDrop = index === 0;
        const size = isPrimaryDrop
          ? randomBetween(9, Math.min(23, 11 + speed * 28))
          : randomBetween(4, Math.min(12, 6 + speed * 13));
        const color = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
        splat.className = 'paint-splat';
        splat.style.width = `${size}px`;
        splat.style.height = `${size * randomBetween(0.66, 1.28)}px`;
        splat.style.background = color;
        splat.style.boxShadow = `0 0 ${Math.max(5, size * 0.82)}px ${color}`;

        splatterLayer.appendChild(splat);
        splatters.add(splat);

        gsap.fromTo(
          splat,
          {
            x: x + randomBetween(-16, 16),
            y: y + randomBetween(-12, 12),
            scale: randomBetween(0.32, 0.68),
            rotation: randomBetween(-42, 42),
            autoAlpha: randomBetween(0.78, 0.96),
          },
          {
            x: `+=${randomBetween(-30, 30)}`,
            y: `+=${randomBetween(20, 58)}`,
            scale: randomBetween(0.92, 1.62),
            rotation: `+=${randomBetween(-28, 28)}`,
            autoAlpha: 0,
            duration: randomBetween(2.15, 3.35),
            ease: 'power2.out',
            onComplete: () => {
              splat.remove();
              splatters.delete(splat);
            },
          },
        );
      }
    };

    const render = () => {
      const detailOpen = Boolean(document.querySelector('.detail-page'));
      cursor.classList.toggle('is-hidden', detailOpen);
      document.documentElement.classList.toggle('detail-cursor-visible', detailOpen);

      current.x += (target.x - current.x) * 0.28;
      current.y += (target.y - current.y) * 0.28;

      const dx = current.x - previous.x;
      const dy = current.y - previous.y;
      const angle = Math.max(-18, Math.min(10, Math.atan2(dy, dx) * (180 / Math.PI) * 0.08 - 8));

      cursor.style.left = `${current.x}px`;
      cursor.style.top = `${current.y}px`;
      cursor.style.setProperty('--brush-angle', `${angle}deg`);

      previous.x = current.x;
      previous.y = current.y;
      rafId = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;

      const now = performance.now();
      const dx = e.clientX - lastSplatPoint.x;
      const dy = e.clientY - lastSplatPoint.y;
      const elapsed = Math.max(1, now - lastSplatPoint.time);
      const speed = Math.hypot(dx, dy) / elapsed;
      lastSplatPoint.x = e.clientX;
      lastSplatPoint.y = e.clientY;
      lastSplatPoint.time = now;

      emitPaintSplatter(e.clientX, e.clientY, speed);
    };

    const onDown = () => {
      cursor.classList.add('is-pressing');
    };

    const onUp = () => {
      cursor.classList.remove('is-pressing');
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('detail-cursor-visible');
      splatters.forEach((splat) => {
        gsap.killTweensOf(splat);
        splat.remove();
      });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <>
      <div ref={splatterLayerRef} className="paint-splatter-layer" />
      <img
        ref={cursorRef}
        src={assetUrl('brush-cursor.png')}
        alt=""
        draggable={false}
        className="brush-cursor"
        style={{ left: '50%', top: '50%' }}
      />
    </>
  );
}
