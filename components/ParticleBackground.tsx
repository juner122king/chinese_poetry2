"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ParticleMode } from "@/lib/theme-map";

type ModeConfig = {
  countDesktop: number;
  countMobile: number;
  size: number;
  /** base RGB 0–1 */
  rgb: [number, number, number];
  /** y spawn range [min, max] in scene units */
  yRange: [number, number];
  xSpread: number;
  fall: number;
  sway: number;
  wander: number;
  /** per-particle twinkle strength 0–1 (stars soft, firefly hard blink) */
  blink: "none" | "soft" | "hard";
  clipClass?: string;
};

const MODE_CONFIG: Record<Exclude<ParticleMode, "none">, ModeConfig> = {
  stars: {
    countDesktop: 200,
    countMobile: 100,
    size: 0.016,
    rgb: [0.85, 0.9, 0.97],
    yRange: [1.2, 5.2],
    xSpread: 16,
    fall: 0,
    sway: 0.008,
    wander: 0,
    blink: "soft",
    clipClass: "particle-clip-sky",
  },
  firefly: {
    countDesktop: 42,
    countMobile: 24,
    size: 0.055,
    rgb: [0.92, 0.78, 0.35],
    yRange: [-3.2, 1.2],
    xSpread: 14,
    fall: 0,
    sway: 0,
    wander: 0.22,
    blink: "hard",
  },
  petals: {
    countDesktop: 55,
    countMobile: 32,
    size: 0.026,
    rgb: [0.84, 0.68, 0.64],
    yRange: [-5, 5.5],
    xSpread: 16,
    fall: 0.22,
    sway: 0.08,
    wander: 0,
    blink: "none",
  },
  leaves: {
    countDesktop: 36,
    countMobile: 22,
    size: 0.03,
    rgb: [0.72, 0.55, 0.32],
    yRange: [-5, 5.5],
    xSpread: 16,
    fall: 0.14,
    sway: 0.12,
    wander: 0,
    blink: "none",
  },
  snow: {
    countDesktop: 150,
    countMobile: 80,
    size: 0.02,
    rgb: [0.93, 0.95, 0.98],
    yRange: [-5, 5.5],
    xSpread: 16,
    fall: 0.2,
    sway: 0.025,
    wander: 0,
    blink: "none",
  },
};

function Particles({
  count,
  mode,
}: {
  count: number;
  mode: Exclude<ParticleMode, "none">;
}) {
  const ref = useRef<THREE.Points>(null);
  const cfg = MODE_CONFIG[mode];

  const { positions, speeds, phases, drifts } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const drifts = new Float32Array(count);
    const [y0, y1] = cfg.yRange;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * cfg.xSpread;
      positions[i * 3 + 1] = y0 + Math.random() * (y1 - y0);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.5 + Math.random() * 1.2;
      phases[i] = Math.random() * Math.PI * 2;
      drifts[i] = 0.6 + Math.random() * 0.8;
    }
    return { positions, speeds, phases, drifts };
  }, [count, cfg]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const [r, g, b] = cfg.rgb;
    for (let i = 0; i < count; i++) {
      // slight per-particle color variance
      const v = 0.88 + Math.random() * 0.14;
      arr[i * 3] = r * v;
      arr[i * 3 + 1] = g * v;
      arr[i * 3 + 2] = b * v;
    }
    return arr;
  }, [count, cfg]);

  const colorAttr = useRef<THREE.BufferAttribute | null>(null);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const pos = points.geometry.attributes.position.array as Float32Array;
    const col = points.geometry.attributes.color.array as Float32Array;
    const t = state.clock.elapsedTime;
    const [y0, y1] = cfg.yRange;
    const [br, bg, bb] = cfg.rgb;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const sp = speeds[i];
      const ph = phases[i];
      const dr = drifts[i];

      // --- motion ---
      if (cfg.fall > 0) {
        pos[ix + 1] -= sp * delta * cfg.fall;
        pos[ix] += Math.sin(t * (0.4 + sp * 0.3) + ph) * delta * cfg.sway * dr * 8;
        if (mode === "leaves") {
          // gentle tumble — kept subtle
          pos[ix] += Math.cos(t * 0.28 + ph) * delta * 0.06;
        }
        if (pos[ix + 1] < y0) {
          pos[ix + 1] = y1;
          pos[ix] = (Math.random() - 0.5) * cfg.xSpread;
        }
      } else if (cfg.wander > 0) {
        // firefly wander in band
        pos[ix] += Math.sin(t * 0.7 * sp + ph) * delta * cfg.wander * 2.2;
        pos[ix + 1] += Math.cos(t * 0.55 * sp + ph * 1.3) * delta * cfg.wander * 1.6;
        // soft clamp into y band
        if (pos[ix + 1] < y0) pos[ix + 1] = y0 + 0.1;
        if (pos[ix + 1] > y1) pos[ix + 1] = y1 - 0.1;
        if (Math.abs(pos[ix]) > cfg.xSpread * 0.55) {
          pos[ix] *= 0.98;
        }
      } else {
        // stars: almost still + tiny sway
        pos[ix + 1] += Math.sin(t * 0.15 + ph) * delta * cfg.sway;
        // keep in sky band
        if (pos[ix + 1] < y0) pos[ix + 1] = y0 + Math.random() * 0.2;
        if (pos[ix + 1] > y1) pos[ix + 1] = y1 - Math.random() * 0.2;
      }

      // --- blink / twinkle via vertex color brightness ---
      let mul = 1;
      if (cfg.blink === "hard") {
        // firefly: clear on/off with unique phase & speed
        const wave = Math.sin(t * (1.1 + sp * 0.9) + ph);
        // hold dark longer, brief glow
        const shaped = Math.pow(Math.max(0, wave), 3);
        mul = 0.06 + shaped * 0.94;
      } else if (cfg.blink === "soft") {
        // stars: gentle twinkle
        const wave = Math.sin(t * (0.4 + sp * 0.25) + ph) * 0.5 + 0.5;
        mul = 0.45 + wave * 0.55;
      }

      col[ix] = br * mul;
      col[ix + 1] = bg * mul;
      col[ix + 2] = bb * mul;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;

    if (mode === "stars") {
      points.rotation.y += delta * 0.004;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          ref={(attr) => {
            colorAttr.current = attr;
          }}
        />
      </bufferGeometry>
      <pointsMaterial
        size={cfg.size}
        vertexColors
        transparent
        opacity={
          mode === "firefly"
            ? 0.9
            : mode === "stars"
              ? 0.75
              : mode === "petals" || mode === "leaves"
                ? 0.48
                : 0.7
        }
        sizeAttenuation
        depthWrite={false}
        blending={
          mode === "firefly" || mode === "stars"
            ? THREE.AdditiveBlending
            : THREE.NormalBlending
        }
      />
    </points>
  );
}

type Props = {
  mode?: ParticleMode;
  className?: string;
  /** 降低画面中心粒子可见度，避免压诗句 */
  safeCenter?: boolean;
};

export default function ParticleBackground({
  mode = "stars",
  className = "",
  safeCenter = false,
}: Props) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (mode === "none") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const cfg = MODE_CONFIG[mode];
    setCount(window.innerWidth < 768 ? cfg.countMobile : cfg.countDesktop);
    setReady(true);
  }, [mode]);

  if (mode === "none" || !ready || count <= 0) return null;

  const cfg = MODE_CONFIG[mode];

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[2] ${cfg.clipClass ?? ""} ${safeCenter ? "particle-safe-center" : ""} ${className}`}
      aria-hidden
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: false }}
        style={{ background: "transparent" }}
      >
        <Particles count={count} mode={mode} />
      </Canvas>
    </div>
  );
}
