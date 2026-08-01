// 生成 app/opengraph-image.png (1200×630) 与 app/apple-icon.png (180×180)。
// 纯 Node，无外部依赖：zlib + 手写 PNG 编码。
// 设计同 LogoMark：宣纸描边 → 墨隙 → 朱砂核心的竖章，落在墨底上。
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const INK = [31, 31, 31];
const PAPER = [245, 239, 226];
const CINNABAR = [178, 58, 72];

// ---- tiny PNG encoder ----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  // PNG chunk：length(4) + type(4) + data(n) + crc(4，覆 type+data)
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(
    crc32(Buffer.concat([Buffer.from(type, "ascii"), data])),
    8 + data.length,
  );
  return out;
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- drawing ----
function makeCanvas(w, h) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = INK[0];
    rgba[i * 4 + 1] = INK[1];
    rgba[i * 4 + 2] = INK[2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

function fillRect(rgba, w, h, x0, y0, x1, y1, [r, g, b]) {
  const xa = Math.max(0, Math.floor(Math.min(x0, x1)));
  const xb = Math.min(w - 1, Math.floor(Math.max(x0, x1)));
  const ya = Math.max(0, Math.floor(Math.min(y0, y1)));
  const yb = Math.min(h - 1, Math.floor(Math.max(y0, y1)));
  for (let y = ya; y <= yb; y++)
    for (let x = xa; x <= xb; x++) {
      const i = (y * w + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
    }
}

function fillRectBlend(rgba, w, h, x0, y0, x1, y1, [r, g, b], alpha) {
  const xa = Math.max(0, Math.floor(Math.min(x0, x1)));
  const xb = Math.min(w - 1, Math.floor(Math.max(x0, x1)));
  const ya = Math.max(0, Math.floor(Math.min(y0, y1)));
  const yb = Math.min(h - 1, Math.floor(Math.max(y0, y1)));
  const inv = 1 - alpha;
  for (let y = ya; y <= yb; y++)
    for (let x = xa; x <= xb; x++) {
      const i = (y * w + x) * 4;
      rgba[i] = Math.round(rgba[i] * inv + r * alpha);
      rgba[i + 1] = Math.round(rgba[i + 1] * inv + g * alpha);
      rgba[i + 2] = Math.round(rgba[i + 2] * inv + b * alpha);
    }
}

/** 竖章：宣纸描边 → 墨隙 → 朱砂核心（16:19，与 LogoMark 同构） */
function drawSeal(rgba, w, h, cx, cy, sw, sh) {
  const outerX0 = Math.round(cx - sw / 2);
  const outerX1 = Math.round(cx + sw / 2);
  const outerY0 = Math.round(cy - sh / 2);
  const outerY1 = Math.round(cy + sh / 2);
  const stroke = Math.max(4, Math.round(sw * 0.05));
  const gap = Math.round(stroke * 0.95);
  fillRect(rgba, w, h, outerX0, outerY0, outerX1, outerY1, PAPER);
  fillRect(
    rgba, w, h,
    outerX0 + stroke, outerY0 + stroke,
    outerX1 - stroke, outerY1 - stroke,
    INK,
  );
  fillRect(
    rgba, w, h,
    outerX0 + stroke + gap, outerY0 + stroke + gap,
    outerX1 - stroke - gap, outerY1 - stroke - gap,
    CINNABAR,
  );
}

// ---- OG 1200×630 ----
{
  const w = 1200;
  const h = 630;
  const rgba = makeCanvas(w, h);
  // 版框：宣纸细线淡入，四边留白
  const inset = 48;
  const frame = 2;
  fillRectBlend(rgba, w, h, inset, inset, inset + frame, h - inset, PAPER, 0.16);
  fillRectBlend(rgba, w, h, inset, inset, w - inset, inset + frame, PAPER, 0.16);
  fillRectBlend(rgba, w, h, w - inset - frame, inset, w - inset, h - inset, PAPER, 0.16);
  fillRectBlend(rgba, w, h, inset, h - inset - frame, w - inset, h - inset, PAPER, 0.16);
  drawSeal(rgba, w, h, w / 2, h / 2, 300, 356);
  writeFileSync(join(ROOT, "app", "opengraph-image.png"), encodePng(w, h, rgba));
  console.log("written app/opengraph-image.png");
}

// ---- Apple icon 180×180 ----
{
  const w = 180;
  const h = 180;
  const rgba = makeCanvas(w, h);
  drawSeal(rgba, w, h, w / 2, h / 2, 108, 128);
  writeFileSync(join(ROOT, "app", "apple-icon.png"), encodePng(w, h, rgba));
  console.log("written app/apple-icon.png");
}
