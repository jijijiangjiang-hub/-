import { useEffect, useRef } from 'react';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

export default function CustomCursor() {
  const cursorRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display = 'none';
      return;
    }

    let rafId = 0;
    const target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    const current = { ...target };
    const previous = { ...target };

    const render = () => {
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
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <img
      ref={cursorRef}
      src={assetUrl('brush-cursor.png')}
      alt=""
      draggable={false}
      className="brush-cursor"
      style={{ left: '50%', top: '50%' }}
    />
  );
}
