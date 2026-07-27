"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ParticleMode } from "@/lib/theme-map";

/** Soft circular sprite — PointsMaterial is square without a map */
function createCircleTexture(soft = true): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  if (soft) {
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.55, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(255,255,255,0)");
  } else {
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.9)");
    g.addColorStop(0.7, "rgba(255,255,255,0.15)");
    g.addColorStop(1, "rgba(255,255,255,0)");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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
  /** stars-frontier: first fraction are bright main stars */
  mainStarRatio?: number;
  materialOpacity?: number;
};

function isStarMode(mode: Exclude<ParticleMode, "none">) {
  return mode === "stars" || mode === "stars-frontier";
}

const MODE_CONFIG: Record<Exclude<ParticleMode, "none">, ModeConfig> = {
  stars: {
    countDesktop: 280,
    countMobile: 140,
    size: 0.028,
    rgb: [0.98, 0.99, 1.0],
    yRange: [1.2, 5.2],
    xSpread: 16,
    fall: 0,
    sway: 0.008, // motion unchanged
    wander: 0,
    blink: "soft",
    clipClass: "particle-clip-sky",
    materialOpacity: 0.96,
  },
  /** 边塞：少量高亮主星 + 更少散星 */
  "stars-frontier": {
    countDesktop: 32,
    countMobile: 18,
    size: 0.04,
    rgb: [0.98, 0.94, 0.86],
    yRange: [1.4, 5.0],
    xSpread: 15,
    fall: 0,
    sway: 0.004, // motion unchanged
    wander: 0,
    blink: "soft",
    clipClass: "particle-clip-sky",
    mainStarRatio: 0.22,
    materialOpacity: 0.98,
  },
  firefly: {
    countDesktop: 58,
    countMobile: 32,
    size: 0.055,
    rgb: [0.92, 0.78, 0.35],
    // keep lower band (near fields / above ground), avoid mid-high text zone
    yRange: [-4.2, -0.4],
    xSpread: 14,
    fall: 0,
    sway: 0,
    // slow drift — blink rate is separate
    wander: 0.08,
    blink: "hard",
  },
  petals: {
    // 花瓣：桃粉、略亮；密度由 theme particleDensity 拉开（春稀 / 花意密）
    countDesktop: 64,
    countMobile: 38,
    size: 0.028,
    rgb: [0.95, 0.7, 0.78],
    yRange: [-5, 5.5],
    xSpread: 16,
    fall: 0.18,
    sway: 0.13,
    wander: 0,
    blink: "none",
    materialOpacity: 0.55,
  },
  leaves: {
    // 秋：暖褐、更慢、侧向翻滚感
    countDesktop: 40,
    countMobile: 24,
    size: 0.034,
    rgb: [0.78, 0.52, 0.28],
    yRange: [-5, 5.5],
    xSpread: 16,
    fall: 0.11,
    sway: 0.16,
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
  const mainCount = Math.max(
    1,
    Math.round(count * (cfg.mainStarRatio ?? 0)),
  );

  const { positions, speeds, phases, drifts, baseColors, roles } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const drifts = new Float32Array(count);
    const baseColors = new Float32Array(count * 3);
    const roles = new Uint8Array(count); // 1 = main star
    const [y0, y1] = cfg.yRange;
    const [r, g, b] = cfg.rgb;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * cfg.xSpread;
      positions[i * 3 + 1] = y0 + Math.random() * (y1 - y0);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      speeds[i] = 0.5 + Math.random() * 1.2;
      phases[i] = Math.random() * Math.PI * 2;
      drifts[i] = 0.6 + Math.random() * 0.8;

      const isMain = mode === "stars-frontier" && i < mainCount;
      roles[i] = isMain ? 1 : 0;
      if (isMain) {
        // 高亮主星（更亮底色，运动参数不变）
        const v = 0.98 + Math.random() * 0.02;
        baseColors[i * 3] = Math.min(1, r * v * 1.1);
        baseColors[i * 3 + 1] = Math.min(1, g * v * 1.06);
        baseColors[i * 3 + 2] = Math.min(1, b * v * 1.02);
      } else if (mode === "stars-frontier") {
        // 散星仍弱于主星，但整体略抬亮
        const v = 0.42 + Math.random() * 0.18;
        baseColors[i * 3] = r * v;
        baseColors[i * 3 + 1] = g * v;
        baseColors[i * 3 + 2] = b * v;
      } else {
        const v = 0.94 + Math.random() * 0.08;
        baseColors[i * 3] = r * v;
        baseColors[i * 3 + 1] = g * v;
        baseColors[i * 3 + 2] = b * v;
      }
    }
    return { positions, speeds, phases, drifts, baseColors, roles };
  }, [count, cfg, mode, mainCount]);

  const colors = useMemo(() => baseColors.slice(), [baseColors]);

  const colorAttr = useRef<THREE.BufferAttribute | null>(null);

  const circleMap = useMemo(() => {
    const soft = mode === "firefly" || isStarMode(mode) || mode === "snow";
    const tex = createCircleTexture(soft);
    return tex;
  }, [mode]);

  useEffect(() => {
    return () => {
      circleMap.dispose();
    };
  }, [circleMap]);

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const pos = points.geometry.attributes.position.array as Float32Array;
    const col = points.geometry.attributes.color.array as Float32Array;
    const t = state.clock.elapsedTime;
    const [y0, y1] = cfg.yRange;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const sp = speeds[i];
      const ph = phases[i];
      const dr = drifts[i];
      const br = baseColors[ix];
      const bg = baseColors[ix + 1];
      const bb = baseColors[ix + 2];
      const isMain = roles[i] === 1;

      // --- motion ---
      if (cfg.fall > 0) {
        pos[ix + 1] -= sp * delta * cfg.fall;
        pos[ix] += Math.sin(t * (0.4 + sp * 0.3) + ph) * delta * cfg.sway * dr * 8;
        if (mode === "leaves") {
          pos[ix] += Math.cos(t * 0.28 + ph) * delta * 0.1;
          pos[ix + 2] += Math.sin(t * 0.35 + ph) * delta * 0.04;
        } else if (mode === "petals") {
          pos[ix] += Math.sin(t * 0.5 + ph) * delta * 0.05;
        }
        if (pos[ix + 1] < y0) {
          pos[ix + 1] = y1;
          pos[ix] = (Math.random() - 0.5) * cfg.xSpread;
        }
      } else if (cfg.wander > 0) {
        pos[ix] += Math.sin(t * 0.28 * sp + ph) * delta * cfg.wander * 1.4;
        pos[ix + 1] +=
          Math.cos(t * 0.22 * sp + ph * 1.3) * delta * cfg.wander * 1.1;
        if (pos[ix + 1] < y0) pos[ix + 1] = y0 + 0.1;
        if (pos[ix + 1] > y1) pos[ix + 1] = y1 - 0.1;
        if (Math.abs(pos[ix]) > cfg.xSpread * 0.55) {
          pos[ix] *= 0.98;
        }
      } else {
        // stars: almost still + tiny sway
        pos[ix + 1] += Math.sin(t * 0.15 + ph) * delta * cfg.sway;
        if (pos[ix + 1] < y0) pos[ix + 1] = y0 + Math.random() * 0.2;
        if (pos[ix + 1] > y1) pos[ix + 1] = y1 - Math.random() * 0.2;
      }

      // --- blink / twinkle via vertex color brightness ---
      let mul = 1;
      if (cfg.blink === "hard") {
        const wave = Math.sin(t * (2.8 + sp * 1.6) + ph);
        const shaped = Math.pow(Math.max(0, wave), 2.4);
        mul = 0.05 + shaped * 0.95;
      } else if (cfg.blink === "soft") {
        // 更高底亮 + 更小闪幅 → 更醒目且不加重「抖」
        const wave = Math.sin(t * (0.4 + sp * 0.25) + ph) * 0.5 + 0.5;
        if (mode === "stars-frontier") {
          mul = isMain ? 0.85 + wave * 0.2 : 0.48 + wave * 0.2;
        } else {
          mul = 0.7 + wave * 0.35;
        }
      }

      col[ix] = br * mul;
      col[ix + 1] = bg * mul;
      col[ix + 2] = bb * mul;
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.color.needsUpdate = true;

    if (isStarMode(mode) && mode !== "stars-frontier") {
      points.rotation.y += delta * 0.004;
    }
  });

  const matOpacity =
    cfg.materialOpacity ??
    (mode === "firefly"
      ? 0.95
      : mode === "petals"
        ? 0.42
        : mode === "leaves"
          ? 0.52
          : 0.7);

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
        map={circleMap}
        alphaMap={circleMap}
        vertexColors
        transparent
        opacity={matOpacity}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.01}
        blending={
          mode === "firefly" || isStarMode(mode)
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
  /** 数量倍率（思乡稀星 / 夜月繁星） */
  density?: number;
};

/**
 * 装饰性粒子不需要指针射线。
 * 默认 connect(divRef) 在卡片 hover 快装快卸 / AnimatePresence 下可能拿到 null，
 * 触发 Provider: Cannot read properties of null (reading 'addEventListener')。
 */
function createNoopEvents() {
  return {
    enabled: false,
    priority: 0,
    handlers: undefined,
    compute: () => {},
    connect: () => {},
    disconnect: () => {},
  };
}

export default function ParticleBackground({
  mode = "stars",
  className = "",
  safeCenter = false,
  density = 1,
}: Props) {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (mode === "none") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const cfg = MODE_CONFIG[mode];
    const base = window.innerWidth < 768 ? cfg.countMobile : cfg.countDesktop;
    const d = Number.isFinite(density) && density > 0 ? density : 1;
    setCount(Math.max(8, Math.round(base * d)));
    setReady(true);
  }, [mode, density]);

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
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ background: "transparent", pointerEvents: "none" }}
        events={createNoopEvents}
      >
        <Particles count={count} mode={mode} />
      </Canvas>
    </div>
  );
}
