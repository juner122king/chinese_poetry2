"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as THREE from "three";
import type { ParticleMode } from "@/lib/theme-map";
import { makeRng } from "@/lib/scene-seed";

/** Soft circular sprite — 星/萤用 PointsMaterial */
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

/** 确定性 0–1，用于回收重采样（避免 Math.random / lint purity） */
function hash01(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

type ModeConfig = {
  countDesktop: number;
  size: number;
  targetPx: number;
  rgb: [number, number, number];
  yBand: { from: "top" | "bottom"; start: number; span: number };
  fall: number;
  sway: number;
  wander: number;
  blink: "none" | "soft" | "hard";
  clipClass?: string;
  mainStarRatio?: number;
  materialOpacity?: number;
  /** 片状椭圆扁平度（>1 更扁）；仅飘落 shader */
  flakeAspect?: number;
};

const MODE_CONFIG: Record<Exclude<ParticleMode, "none">, ModeConfig> = {
  stars: {
    countDesktop: 280,
    size: 0.028,
    targetPx: 2.6,
    rgb: [0.98, 0.99, 1.0],
    yBand: { from: "top", start: 0, span: 0.4 },
    fall: 0,
    sway: 0.012,
    wander: 0,
    blink: "soft",
    clipClass: "particle-clip-sky",
    materialOpacity: 0.96,
  },
  "stars-frontier": {
    countDesktop: 32,
    size: 0.04,
    targetPx: 3.2,
    rgb: [0.98, 0.94, 0.86],
    yBand: { from: "top", start: 0, span: 0.38 },
    fall: 0,
    sway: 0.008,
    wander: 0,
    blink: "soft",
    clipClass: "particle-clip-sky",
    mainStarRatio: 0.22,
    materialOpacity: 0.98,
  },
  firefly: {
    countDesktop: 78,
    size: 0.055,
    // 点染用小点；星保持原 targetPx 不动
    targetPx: 2.2,
    rgb: [0.92, 0.78, 0.35],
    yBand: { from: "bottom", start: 0, span: 0.42 },
    fall: 0,
    sway: 0,
    wander: 0.08,
    blink: "hard",
  },
  petals: {
    countDesktop: 48,
    size: 0.028,
    // 点染用小瓣，避免详情页「一片片」抢字
    targetPx: 1.45,
    rgb: [0.95, 0.7, 0.78],
    yBand: { from: "top", start: -0.05, span: 1.1 },
    fall: 0.14,
    sway: 0.16,
    wander: 0,
    blink: "none",
    materialOpacity: 0.5,
    flakeAspect: 1.85,
  },
  leaves: {
    countDesktop: 40,
    size: 0.034,
    targetPx: 1.7,
    rgb: [0.78, 0.52, 0.28],
    yBand: { from: "top", start: -0.05, span: 1.1 },
    // 以落为主：沉得下、少横漂（秋叶非春瓣）
    fall: 0.15,
    sway: 0.08,
    wander: 0,
    blink: "none",
    materialOpacity: 0.5,
    flakeAspect: 2.15,
  },
  snow: {
    countDesktop: 90,
    size: 0.02,
    targetPx: 0.95,
    rgb: [0.93, 0.95, 0.98],
    yBand: { from: "top", start: -0.05, span: 1.1 },
    fall: 0.16,
    sway: 0.04,
    wander: 0,
    blink: "none",
    materialOpacity: 0.5,
    flakeAspect: 1.12,
  },
};

const REF_AREA = 1440 * 900;
const CAM_Z = 5;

function isFallMode(mode: Exclude<ParticleMode, "none">) {
  return mode === "petals" || mode === "leaves" || mode === "snow";
}

function yRangeFromViewport(
  band: ModeConfig["yBand"],
  vh: number,
): [number, number] {
  const half = vh / 2;
  if (band.from === "top") {
    const y1 = half * (1 - band.start * 2);
    const y0 = y1 - vh * band.span;
    return [y0, y1];
  }
  const y0 = -half + vh * band.start;
  const y1 = y0 + vh * band.span;
  return [y0, y1];
}

/** 飘落：椭圆片 + 尺寸/自旋 attribute */
const FLAKE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpin;
  attribute float aAspect;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uBaseSize;
  varying vec3 vColor;
  varying float vAngle;
  varying float vAspect;

  void main() {
    vColor = color;
    vAngle = aPhase + uTime * aSpin;
    vAspect = aAspect;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float atten = uBaseSize * (280.0 / max(0.001, -mvPosition.z));
    gl_PointSize = max(1.2, aSize * atten * uPixelRatio);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FLAKE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAngle;
  varying float vAspect;
  uniform float uOpacity;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float c = cos(vAngle);
    float s = sin(vAngle);
    vec2 r = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
    // 椭圆：纵向压扁 → 片状
    r.y *= vAspect;
    float d = length(r) * 2.0;
    float alpha = 1.0 - smoothstep(0.28, 1.0, d);
    // 中心略亮，边缘柔
    alpha *= mix(0.55, 1.0, 1.0 - smoothstep(0.0, 0.55, d));
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(vColor, alpha * uOpacity);
  }
`;

function Particles({
  count,
  mode,
}: {
  count: number;
  mode: Exclude<ParticleMode, "none">;
}) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.ShaderMaterial | THREE.PointsMaterial>(null);
  const cfg = MODE_CONFIG[mode];
  const { viewport, size: canvasSize } = useThree();
  const mainCount = Math.max(
    1,
    Math.round(count * (cfg.mainStarRatio ?? 0)),
  );

  const xSpread = viewport.width * 1.15;
  const vh = viewport.height;
  const [y0, y1] = yRangeFromViewport(cfg.yBand, vh);
  const worldSize =
    (cfg.targetPx * 2 * CAM_Z) / Math.max(canvasSize.height, 1);
  const isStar = mode === "stars" || mode === "stars-frontier";
  const fall = isFallMode(mode);

  const sim = useMemo(() => {
    const rng = makeRng(
      `particles:${mode}:${count}:${xSpread.toFixed(2)}:${y0.toFixed(2)}`,
    );
    const positions = new Float32Array(count * 3);
    const homeY = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const drifts = new Float32Array(count);
    const baseColors = new Float32Array(count * 3);
    const roles = new Uint8Array(count);

    // 飘落 per-particle
    const fallMul = new Float32Array(count);
    const swayAmp = new Float32Array(count);
    const swayFreq = new Float32Array(count);
    const swayFreq2 = new Float32Array(count);
    const windPhase = new Float32Array(count);
    const windDir = new Float32Array(count);
    const spin = new Float32Array(count);
    const sizes = new Float32Array(count);
    const aspects = new Float32Array(count);
    const alphaMul = new Float32Array(count);

    const [r, g, b] = cfg.rgb;
    const zSpread = Math.min(4.5, Math.max(2.5, viewport.distance * 0.9));
    const baseAspect = cfg.flakeAspect ?? 1.2;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * xSpread;
      const y = y0 + rng() * (y1 - y0);
      positions[i * 3 + 1] = y;
      homeY[i] = y;
      positions[i * 3 + 2] = (rng() - 0.5) * zSpread;
      speeds[i] = 0.5 + rng() * 1.2;
      phases[i] = rng() * Math.PI * 2;
      drifts[i] = 0.6 + rng() * 0.8;

      if (fall) {
        // 自旋方向各半，避免全体同向齐转
        const spinSign = rng() < 0.5 ? -1 : 1;
        if (mode === "petals") {
          fallMul[i] = 0.45 + rng() * 0.9;
          swayAmp[i] = 0.7 + rng() * 0.9;
          swayFreq[i] = 0.25 + rng() * 0.6;
          swayFreq2[i] = 0.6 + rng() * 0.8;
          spin[i] = (0.35 + rng() * 0.85) * spinSign;
          // 尺寸倍率收窄，避免偶发「过大」瓣
          sizes[i] = 0.45 + rng() * 0.3;
          aspects[i] = baseAspect * (0.85 + rng() * 0.35);
          alphaMul[i] = 0.55 + rng() * 0.45;
        } else if (mode === "leaves") {
          fallMul[i] = 0.7 + rng() * 0.65;
          swayAmp[i] = 0.35 + rng() * 0.5;
          swayFreq[i] = 0.12 + rng() * 0.22;
          swayFreq2[i] = 0.25 + rng() * 0.35;
          spin[i] = (0.65 + rng() * 1.15) * spinSign;
          sizes[i] = 0.5 + rng() * 0.35;
          aspects[i] = baseAspect * (0.9 + rng() * 0.3);
          alphaMul[i] = 0.6 + rng() * 0.4;
          // 单向斜落风向（晚来风），非左右横飘
          windDir[i] = rng() < 0.5 ? -1 : 1;
        } else {
          // snow
          fallMul[i] = 0.5 + rng() * 0.9;
          swayAmp[i] = 0.25 + rng() * 0.45;
          swayFreq[i] = 0.15 + rng() * 0.3;
          swayFreq2[i] = 0.3 + rng() * 0.6;
          spin[i] = (0.08 + rng() * 0.25) * spinSign;
          sizes[i] = 0.35 + rng() * 0.28;
          aspects[i] = baseAspect * (0.92 + rng() * 0.2);
          alphaMul[i] = 0.4 + rng() * 0.55;
          windDir[i] = 0;
        }
        windPhase[i] = rng() * Math.PI * 2;
        if (mode === "petals") windDir[i] = 0;
      } else {
        fallMul[i] = 1;
        swayAmp[i] = 1;
        swayFreq[i] = 0.4;
        swayFreq2[i] = 0.8;
        windPhase[i] = 0;
        windDir[i] = 0;
        spin[i] = 0;
        sizes[i] = 1;
        aspects[i] = 1;
        alphaMul[i] = 1;
      }

      const isMain = mode === "stars-frontier" && i < mainCount;
      const isBrightStar = mode === "stars" && rng() < 0.2;
      roles[i] = isMain || isBrightStar ? 1 : 0;

      if (isMain) {
        const v = 0.98 + rng() * 0.02;
        baseColors[i * 3] = Math.min(1, r * v * 1.1);
        baseColors[i * 3 + 1] = Math.min(1, g * v * 1.06);
        baseColors[i * 3 + 2] = Math.min(1, b * v * 1.02);
      } else if (mode === "stars-frontier") {
        const v = 0.28 + rng() * 0.18;
        baseColors[i * 3] = r * v;
        baseColors[i * 3 + 1] = g * v;
        baseColors[i * 3 + 2] = b * v;
      } else if (mode === "stars") {
        if (isBrightStar) {
          const v = 0.95 + rng() * 0.05;
          baseColors[i * 3] = Math.min(1, r * v);
          baseColors[i * 3 + 1] = Math.min(1, g * v);
          baseColors[i * 3 + 2] = Math.min(1, b * v);
        } else {
          const v = 0.32 + rng() * 0.28;
          baseColors[i * 3] = r * v;
          baseColors[i * 3 + 1] = g * v;
          baseColors[i * 3 + 2] = b * v;
        }
      } else if (fall) {
        // 飘落：色相微抖 + alphaMul 作明暗
        const v = (0.88 + rng() * 0.14) * alphaMul[i];
        const tint = (rng() - 0.5) * 0.06;
        baseColors[i * 3] = Math.min(1, Math.max(0, r * v + tint));
        baseColors[i * 3 + 1] = Math.min(1, Math.max(0, g * v));
        baseColors[i * 3 + 2] = Math.min(1, Math.max(0, b * v - tint * 0.5));
      } else {
        const v = 0.94 + rng() * 0.08;
        baseColors[i * 3] = r * v;
        baseColors[i * 3 + 1] = g * v;
        baseColors[i * 3 + 2] = b * v;
      }
    }

    return {
      positions,
      homeY,
      speeds,
      phases,
      drifts,
      baseColors,
      roles,
      fallMul,
      swayAmp,
      swayFreq,
      swayFreq2,
      windPhase,
      windDir,
      spin,
      sizes,
      aspects,
      alphaMul,
    };
  }, [
    count,
    mode,
    mainCount,
    xSpread,
    y0,
    y1,
    viewport.distance,
    cfg.rgb,
    cfg.flakeAspect,
    fall,
  ]);

  const colors = useMemo(
    () => sim.baseColors.slice(),
    [sim.baseColors],
  );

  const circleMap = useMemo(() => {
    if (fall) return null;
    const soft =
      mode === "firefly" ||
      mode === "stars" ||
      mode === "stars-frontier";
    return createCircleTexture(soft);
  }, [mode, fall]);

  useEffect(() => {
    return () => {
      circleMap?.dispose();
    };
  }, [circleMap]);

  const flakeUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uBaseSize: { value: worldSize * 42 },
      uOpacity: {
        value:
          cfg.materialOpacity ??
          (mode === "petals" ? 0.5 : mode === "leaves" ? 0.52 : 0.62),
      },
    }),
    [worldSize, cfg.materialOpacity, mode],
  );

  useFrame((state, delta) => {
    const points = ref.current;
    if (!points) return;
    const pos = points.geometry.attributes.position.array as Float32Array;
    const col = points.geometry.attributes.color.array as Float32Array;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const xLimit = xSpread * 0.55;

    const {
      homeY,
      speeds,
      phases,
      drifts,
      baseColors,
      roles,
      fallMul,
      swayAmp,
      swayFreq,
      swayFreq2,
      windPhase,
      windDir,
      spin,
    } = sim;

    if (fall && matRef.current && "uniforms" in matRef.current) {
      const m = matRef.current as THREE.ShaderMaterial;
      m.uniforms.uTime.value = t;
      m.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
      m.uniforms.uBaseSize.value = worldSize * 42;
    }

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const sp = speeds[i];
      const ph = phases[i];
      const dr = drifts[i];
      const br = baseColors[ix];
      const bg = baseColors[ix + 1];
      const bb = baseColors[ix + 2];
      const isMain = roles[i] === 1;

      if (cfg.fall > 0) {
        const fm = fallMul[i];
        const amp = swayAmp[i];
        const f1 = swayFreq[i];
        const f2 = swayFreq2[i];
        const wp = windPhase[i];

        // 落速：轻调制，非恒速
        const fallSpeed =
          cfg.fall * fm * (0.88 + 0.12 * Math.sin(t * 0.3 + ph));
        pos[ix + 1] -= fallSpeed * dt;

        // 阵风：叶/雪更稳，瓣保留尖峰
        const gustBase = Math.max(0, Math.sin(t * 0.11 + wp));
        const gust =
          mode === "petals"
            ? 0.35 + 0.65 * gustBase * gustBase
            : 0.6 + 0.4 * gustBase * gustBase;

        const swayScale = cfg.sway * amp;
        // 叶侧摆系数更低，避免横漂盖过下落
        const swayMul = mode === "leaves" ? 3.2 : 6;
        const swayMul2 = mode === "leaves" ? 1.2 : 2.5;
        pos[ix] +=
          Math.sin(t * f1 + ph) * dt * swayScale * swayMul * gust;
        pos[ix] +=
          Math.sin(t * f2 + ph * 1.7) * dt * swayScale * swayMul2;

        if (mode === "petals") {
          pos[ix] +=
            Math.cos(t * f1 * 0.5 + ph) * dt * 0.07 * amp;
          pos[ix + 2] +=
            Math.sin(t * f2 * 0.4 + ph) * dt * spin[i] * 0.03;
        } else if (mode === "leaves") {
          // 斜落 + 轻摆 + 翻滚（非来回横飘）
          pos[ix] += windDir[i] * fallSpeed * 0.18 * dt;
          pos[ix] += Math.cos(t * 0.22 + ph) * dt * 0.04 * amp;
          pos[ix + 2] +=
            Math.sin(t * 0.4 + ph) * dt * spin[i] * 0.06;
        } else {
          // snow：更稳
          pos[ix] += Math.sin(t * f1 * 0.7 + ph) * dt * 0.025;
        }

        if (pos[ix + 1] < y0) {
          // 入口高度微散 + 全宽重采样，打破竖条
          const h = hash01(ph, t * 0.17 + i);
          const h2 = hash01(i * 0.13, ph + t);
          pos[ix + 1] = y1 + h * 0.12 * vh;
          pos[ix] = (h2 - 0.5) * xSpread;
          pos[ix + 2] = (hash01(ph + 2.1, i) - 0.5) * 3.5;
        }
      } else if (cfg.wander > 0) {
        pos[ix] += Math.sin(t * 0.28 * sp + ph) * dt * cfg.wander * 1.4;
        pos[ix + 1] +=
          Math.cos(t * 0.22 * sp + ph * 1.3) * dt * cfg.wander * 1.1;
        if (pos[ix + 1] < y0) pos[ix + 1] = y1;
        if (pos[ix + 1] > y1) pos[ix + 1] = y0;
        if (pos[ix] > xLimit) pos[ix] = -xLimit;
        if (pos[ix] < -xLimit) pos[ix] = xLimit;
      } else if (isStar) {
        pos[ix + 1] =
          homeY[i] + Math.sin(t * 0.15 + ph) * cfg.sway * dr;
      } else {
        pos[ix + 1] += Math.sin(t * 0.15 + ph) * dt * cfg.sway;
        if (pos[ix + 1] < y0) pos[ix + 1] = y0 + (ph % 0.2);
        if (pos[ix + 1] > y1) pos[ix + 1] = y1 - (ph % 0.2);
      }

      let mul = 1;
      if (cfg.blink === "hard") {
        const wave = Math.sin(t * (2.8 + sp * 1.6) + ph);
        const shaped = Math.pow(Math.max(0, wave), 2.4);
        mul = 0.05 + shaped * 0.95;
      } else if (cfg.blink === "soft") {
        const wave = Math.sin(t * (0.4 + sp * 0.25) + ph) * 0.5 + 0.5;
        if (mode === "stars-frontier") {
          mul = isMain ? 0.88 + wave * 0.18 : 0.38 + wave * 0.18;
        } else if (mode === "stars") {
          mul = isMain ? 0.88 + wave * 0.2 : 0.38 + wave * 0.2;
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

    if (mode === "stars") {
      points.rotation.y += dt * 0.001;
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
        <bufferAttribute attach="attributes-position" args={[sim.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        {fall ? (
          <>
            <bufferAttribute attach="attributes-aSize" args={[sim.sizes, 1]} />
            <bufferAttribute attach="attributes-aPhase" args={[sim.phases, 1]} />
            <bufferAttribute attach="attributes-aSpin" args={[sim.spin, 1]} />
            <bufferAttribute
              attach="attributes-aAspect"
              args={[sim.aspects, 1]}
            />
          </>
        ) : null}
      </bufferGeometry>
      {fall ? (
        <shaderMaterial
          ref={matRef as React.RefObject<THREE.ShaderMaterial>}
          vertexShader={FLAKE_VERT}
          fragmentShader={FLAKE_FRAG}
          uniforms={flakeUniforms}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      ) : (
        <pointsMaterial
          ref={matRef as React.RefObject<THREE.PointsMaterial>}
          size={worldSize}
          map={circleMap!}
          alphaMap={circleMap!}
          vertexColors
          transparent
          opacity={matOpacity}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.01}
          blending={
            mode === "firefly" || mode === "stars" || mode === "stars-frontier"
              ? THREE.AdditiveBlending
              : THREE.NormalBlending
          }
        />
      )}
    </points>
  );
}

type Props = {
  mode?: ParticleMode;
  className?: string;
  safeCenter?: boolean;
  density?: number;
};

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

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function ParticleBackground({
  mode = "stars",
  className = "",
  safeCenter = false,
  density = 1,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [inView, setInView] = useState(true);
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      setBox({
        w: el.clientWidth || window.innerWidth,
        h: el.clientHeight || window.innerHeight,
      });
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "10% 0px", threshold: 0.01 },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  if (mode === "none") return null;

  const cfg = MODE_CONFIG[mode];
  const d = Number.isFinite(density) && density > 0 ? density : 1;
  const area = (box.w || 1) * (box.h || 1);
  const areaScale = Math.min(1, Math.max(0.15, area / REF_AREA));
  const count =
    box.w > 0
      ? Math.max(8, Math.round(cfg.countDesktop * d * areaScale))
      : 0;
  const show = !reduce && inView && count > 0;

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none absolute inset-0 z-[2] ${cfg.clipClass ?? ""} ${safeCenter ? "particle-safe-center" : ""} ${className}`}
      aria-hidden
    >
      {show ? (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, CAM_Z], fov: 50 }}
          gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
          style={{ background: "transparent", pointerEvents: "none" }}
          events={createNoopEvents}
          frameloop="always"
        >
          <Particles count={count} mode={mode} />
        </Canvas>
      ) : null}
    </div>
  );
}
