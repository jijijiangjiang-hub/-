import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';

const assetUrl = (fileName: string) => `${import.meta.env.BASE_URL}assets/${fileName}`;

const VORTEX_DURATION = 6600;
const BLACK_HOLD = 1000;
const REVEAL_DURATION = 3900;
const PUPIL = new THREE.Vector2(0.554, 0.747);

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uProgress;
  uniform float uTextureAspect;
  uniform vec2 uResolution;
  uniform vec2 uPupil;
  varying vec2 vUv;

  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / uResolution.y;
    vec2 ratio = vec2(1.0);

    if (screenAspect > uTextureAspect) {
      ratio.y = uTextureAspect / screenAspect;
    } else {
      ratio.x = screenAspect / uTextureAspect;
    }

    return (uv - 0.5) * ratio + 0.5;
  }

  float grain(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    float p = clamp(uProgress, 0.0, 1.0);
    float focusP = easeInOutCubic(smoothstep(0.0, 0.38, p));
    float zoomP = easeInOutCubic(smoothstep(0.02, 0.43, p));
    float vortexP = smoothstep(0.42, 0.9, p);
    float swallowP = vortexP;

    vec2 screenUv = coverUv(vUv);
    vec2 focus = mix(vec2(0.5), uPupil, focusP);
    float zoom = mix(1.0, 18.0, zoomP);
    vec2 zoomed = (screenUv - vec2(0.5)) / zoom + focus;

    vec2 vortexVec = zoomed - focus;
    float radius = length(vortexVec);
    float angle = atan(vortexVec.y, vortexVec.x);
    float pull = smoothstep(0.52, 0.0, radius);
    angle += vortexP * (3.2 + 3.8 * pull);
    radius *= mix(1.0, 0.38, vortexP * pull);

    vec2 twisted = focus + vec2(cos(angle), sin(angle)) * radius;
    vec4 color = texture2D(uTexture, twisted);

    vec2 screenCenter = vUv - 0.5;
    float vignette = smoothstep(0.82, 0.18, length(screenCenter));
    color.rgb *= mix(0.66, 1.15, vignette);

    float ring = sin((radius * 28.0) - (vortexP * 7.0)) * 0.5 + 0.5;
    color.rgb += vec3(0.28, 0.18, 0.05) * ring * vortexP * (1.0 - swallowP) * 0.18;

    float blackRadius = mix(0.96, 0.0, swallowP);
    float blackMask = smoothstep(blackRadius - 0.18, blackRadius, length(screenCenter));
    color.rgb = mix(color.rgb, vec3(0.0), blackMask);

    float finalBlack = smoothstep(0.9, 1.0, p);
    color.rgb = mix(color.rgb, vec3(0.0), finalBlack);

    float noise = (grain(vUv * uResolution + p * 400.0) - 0.5) * 0.08;
    color.rgb += noise * (1.0 - finalBlack);

    gl_FragColor = vec4(color.rgb, 1.0);
  }
`;

export default function EyeTransition() {
  const phase = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'vortex') return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    let rafId = 0;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uProgress: { value: 0 },
      uTextureAspect: { value: 1672 / 941 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uPupil: { value: PUPIL },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const texture = new THREE.TextureLoader().load(assetUrl('intro-eye.png'), (loadedTexture) => {
      const image = loadedTexture.image as { width: number; height: number };
      uniforms.uTextureAspect.value = image.width / image.height;
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    uniforms.uTexture.value = texture;

    const startTime = performance.now();

    const render = () => {
      if (disposed) return;

      const elapsed = performance.now() - startTime;
      uniforms.uProgress.value = Math.min(elapsed / VORTEX_DURATION, 1);
      renderer.render(scene, camera);

      if (elapsed >= VORTEX_DURATION + BLACK_HOLD) {
        setPhase('reveal');
        return;
      }

      rafId = requestAnimationFrame(render);
    };

    const dispose = () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      uniforms.uResolution.value.set(width, height);
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);
    render();

    return () => {
      window.removeEventListener('resize', onResize);
      dispose();
    };
  }, [phase, setPhase]);

  return (
    <AnimatePresence>
      {phase === 'vortex' && (
        <motion.div
          key="eye-transition"
          ref={containerRef}
          className="eye-transition"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="vortex-noise" />
        </motion.div>
      )}

      {phase === 'reveal' && (
        <EyeRevealOverlay key="eye-reveal" onComplete={() => setPhase('main')} />
      )}
    </AnimatePresence>
  );
}

function EyeRevealOverlay({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, REVEAL_DURATION);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="eye-reveal"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="eye-lid eye-lid-top" />
      <div className="eye-lid eye-lid-bottom" />
      <div className="eye-haze" />
    </motion.div>
  );
}
