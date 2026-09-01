/* Генератор иконок PWA — рисует гранат (тело + «корона») без внешних зависимостей.
   Запуск:  node scripts/make-icons.mjs
   Результат кладётся в public/: icon-192, icon-512, icon-maskable-512, apple-touch-icon, favicon-32. */

import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(fileURLToPath(new URL("../public", import.meta.url)));
fs.mkdirSync(OUT, { recursive: true });

/* ── минимальный PNG-энкодер (RGBA, 8 бит, без интерлейса) ── */
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
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/* ── палитра Նուռ ── */
const GARNET = [0x9e, 0x1f, 0x26];
const PARCH = [0xfb, 0xf3, 0xea];
const TUF = [0xea, 0xda, 0xce];

/* ── отрисовка ── */
function drawIcon(N, { bg, body, cyScale = 0.6, bodyRScale = 0.32 }) {
  const rgba = Buffer.alloc(N * N * 4);
  const cx = N / 2;
  const cy = N * cyScale;
  const bodyR = N * bodyRScale;
  const calyxHalf = bodyR * 0.5;
  const valleyY = cy - bodyR + N * 0.015;
  const peakY = cy - bodyR - N * 0.11;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let col = bg;
      const dx = x - cx;
      const dy = y - cy;

      // тело граната + мягкий блик слева-сверху
      if (dx * dx + dy * dy <= bodyR * bodyR) {
        col = body;
        const hx = x - (cx - bodyR * 0.3);
        const hy = y - (cy - bodyR * 0.32);
        const hd = Math.sqrt(hx * hx + hy * hy) / (bodyR * 0.7);
        const k = Math.max(0, 1 - hd) ** 2; // 1 в центре блика → 0 к краю
        col = [
          Math.min(255, Math.round(body[0] + 30 * k)),
          Math.min(255, Math.round(body[1] + 20 * k)),
          Math.min(255, Math.round(body[2] + 16 * k)),
        ];
      }

      // «корона» — 3 зубца сверху
      if (x >= cx - calyxHalf && x <= cx + calyxHalf && y <= valleyY + N * 0.03) {
        const u = (x - (cx - calyxHalf)) / (2 * calyxHalf); // 0..1
        const t = (u * 3) % 1;
        const shape = 1 - Math.abs(2 * t - 1); // 0 по краям зубца, 1 в центре
        const top = valleyY - (valleyY - peakY) * shape;
        if (y >= top) col = body;
      }

      const i = (y * N + x) * 4;
      rgba[i] = col[0];
      rgba[i + 1] = col[1];
      rgba[i + 2] = col[2];
      rgba[i + 3] = 255;
    }
  }
  return encodePNG(N, N, rgba);
}

const files = [
  ["icon-192.png", drawIcon(192, { bg: PARCH, body: GARNET })],
  ["icon-512.png", drawIcon(512, { bg: PARCH, body: GARNET })],
  ["icon-maskable-512.png", drawIcon(512, { bg: GARNET, body: PARCH, bodyRScale: 0.24, cyScale: 0.58 })],
  ["apple-touch-icon.png", drawIcon(180, { bg: TUF, body: GARNET })],
  ["favicon-32.png", drawIcon(32, { bg: PARCH, body: GARNET })],
];

for (const [name, buf] of files) {
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log("→ public/" + name + "  (" + buf.length + " B)");
}
