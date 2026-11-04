/* Genera los assets de marca (logo / isotipo / favicon / og) desde los PNG del
   manual (RGB con fondo plano, sin transparencia).

   Chroma-key por color de fondo con "un-premultiply": el alfa de cada píxel es
   su proyección sobre el eje fondo -> arte, así que el antialias se reconstruye
   sin comerse los bordes. El RGB se reemplaza por el color de marca exacto.

   OJO sharp: `trim()` no sirve aquí (todo el RGB queda del mismo color plano,
   así que no detecta el borde) — el recorte se hace con el bbox del alfa.

   Ejecutar (bun <archivo>.mjs se cuelga con sharp en este entorno):
     cd /home/team/shared/site && bun -e "$(cat scripts/brand-logos.mjs)"
*/
import sharp from "sharp";
import fs from "node:fs";

const LOGOS = "/home/team/shared/brand/logos";
const SITE = "/home/team/shared/site";
const CREAM = "#F8F9DF"; // MORNING GLOW
const DUO = "#5C6038"; // BETTER TOGETHER
const FLATS = JSON.parse(fs.readFileSync("/home/team/shared/brand/logos-flats.json", "utf8"));

const hex = (h) => ({
  r: parseInt(h.slice(1, 3), 16),
  g: parseInt(h.slice(3, 5), 16),
  b: parseInt(h.slice(5, 7), 16),
});

const report = [];
const say = (s) => {
  report.push(s);
  fs.writeFileSync("/tmp/brand-report.txt", report.join("\n") + "\n");
  console.log(s);
};

/** key + recorte por bbox del alfa. Devuelve {buf (PNG RGBA recortado), w, h, coverage} */
async function keyed(srcFile, targetHex) {
  const { data, info } = await sharp(`${LOGOS}/${srcFile}`)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  const bg = hex(FLATS[srcFile].bg);
  const art = hex(FLATS[srcFile].art);
  const t = hex(targetHex);
  const d = [art.r - bg.r, art.g - bg.g, art.b - bg.b];
  const dd = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0, p = 0; p < w * h; p++, i += ch) {
    const pr = data[i] - bg.r,
      pg = data[i + 1] - bg.g,
      pb = data[i + 2] - bg.b;
    let a = (pr * d[0] + pg * d[1] + pb * d[2]) / dd;
    a = (a - 0.02) / 0.96; // limpia el ruido del fondo plano
    if (a < 0) a = 0;
    if (a > 1) a = 1;
    const o = p * 4;
    out[o] = t.r;
    out[o + 1] = t.g;
    out[o + 2] = t.b;
    out[o + 3] = Math.round(a * 255);
  }
  const buf0 = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .median(5) // borra las guías de 1-2 px que traen algunos PNG del manual
    .raw()
    .toBuffer();

  /* Recorte: algunos PNG traen guías de corte sueltas. Se etiquetan los
     componentes conexos del alfa (a 1/4 de escala) y solo cuentan los que tienen
     cuerpo (no líneas finas) y un área comparable a la del arte. */
  const F = 4;
  const mw = Math.floor(w / F),
    mh = Math.floor(h / F);
  const mask = await sharp(buf0, { raw: { width: w, height: h, channels: 4 } })
    .extractChannel(3)
    .resize(mw, mh, { kernel: "nearest" })
    .raw()
    .toBuffer();
  const seen = new Uint8Array(mw * mh);
  const comps = [];
  for (let p = 0; p < mw * mh; p++) {
    if (seen[p] || mask[p] < 128) continue;
    const stack = [p];
    seen[p] = 1;
    let n = 0,
      x0 = mw,
      y0 = mh,
      x1 = 0,
      y1 = 0;
    while (stack.length) {
      const q = stack.pop();
      const x = q % mw,
        y = (q - x) / mw;
      n++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x > 0 && !seen[q - 1] && mask[q - 1] >= 128) (seen[q - 1] = 1), stack.push(q - 1);
      if (x < mw - 1 && !seen[q + 1] && mask[q + 1] >= 128) (seen[q + 1] = 1), stack.push(q + 1);
      if (y > 0 && !seen[q - mw] && mask[q - mw] >= 128) (seen[q - mw] = 1), stack.push(q - mw);
      if (y < mh - 1 && !seen[q + mw] && mask[q + mw] >= 128) (seen[q + mw] = 1), stack.push(q + mw);
    }
    comps.push({ n, x0, y0, x1, y1, min: Math.min(x1 - x0 + 1, y1 - y0 + 1) });
  }
  const biggest = comps.reduce((a, b) => (b.n > a.n ? b : a), { n: 0 });
  const kept = comps.filter((c) => c.min > 3 && c.n > biggest.n * 0.005);
  const dropped = comps.filter((c) => !kept.includes(c));
  const kx0 = Math.max(0, Math.min(...kept.map((c) => c.x0)) * F);
  const ky0 = Math.max(0, Math.min(...kept.map((c) => c.y0)) * F);
  const kx1 = Math.min(w - 1, (Math.max(...kept.map((c) => c.x1)) + 1) * F - 1);
  const ky1 = Math.min(h - 1, (Math.max(...kept.map((c) => c.y1)) + 1) * F - 1);
  const bw = kx1 - kx0 + 1,
    bh = ky1 - ky0 + 1;
  const strays = dropped.reduce((s, c) => s + c.n, 0) * F * F;
  const buf = await sharp(buf0, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: kx0, top: ky0, width: bw, height: bh })
    .png()
    .toBuffer();
  return {
    buf,
    w: bw,
    h: bh,
    coverage: ((biggest.n * F * F * 100) / (w * h)).toFixed(2),
    strays,
    comps: comps.length,
    droppedComps: dropped.length,
  };
}

/** pad de área de seguridad + resize, en dos pasos (evita ambigüedad extend/resize) */
async function withPad(k, padRatio, finalWidth, file, format) {
  const pad = Math.round(k.h * padRatio);
  const padded = await sharp(k.buf)
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const pipe = sharp(padded).resize({ width: finalWidth });
  if (format === "webp") pipe.webp({ lossless: true, effort: 6 });
  else pipe.png({ compressionLevel: 9 });
  await pipe.toFile(file);
  return { pad, abs: `${SITE}/${file}` };
}

/* ── 1. marca principal (logotipo + "PILATES STUDIO") ── */
const wordCream = await keyed("logo-05.png", CREAM);
const wordDuo = await keyed("logo-04.png", DUO);
say(
  `marca principal: arte ${wordCream.w}x${wordCream.h} (${(wordCream.w / wordCream.h).toFixed(2)}:1, ${wordCream.comps} componentes, ${wordCream.droppedComps} guías descartadas ≈${wordCream.strays}px)`,
);
for (const [k, name] of [
  [wordCream, "logo-cream"],
  [wordDuo, "logo-duo"],
]) {
  const r = await withPad(k, 0.1, 640, `src/assets/${name}.webp`, "webp");
  const m = await sharp(r.abs).metadata();
  const bytes = fs.statSync(r.abs).size;
  say(`  src/assets/${name}.webp ${m.width}x${m.height} pad=${r.pad}px (${bytes} B)`);
}

/* ── 2. isotipo ── */
const isoCream = await keyed("logo-13.png", CREAM);
const isoDuo = await keyed("logo-12.png", DUO);
say(`isotipo: arte ${isoCream.w}x${isoCream.h} (${(isoCream.w / isoCream.h).toFixed(2)}:1)`);
for (const [k, name] of [
  [isoCream, "isotipo-cream"],
  [isoDuo, "isotipo-duo"],
]) {
  const r = await withPad(k, 0.12, 320, `src/assets/${name}.webp`, "webp");
  const m = await sharp(r.abs).metadata();
  say(`  src/assets/${name}.webp ${m.width}x${m.height} pad=${r.pad}px (${fs.statSync(r.abs).size} B)`);
}

/* ── 3. favicon / apple-touch ── */
const favDuo = await withPad(isoDuo, 0.12, 512, "public/favicon.png", "png");
const favCream = await withPad(isoCream, 0.12, 512, "public/favicon-dark.png", "png");
say(`favicon.png ${(await sharp(favDuo.abs).metadata()).width}px + favicon-dark.png (chrome oscuro)`);
const touchIso = await sharp(favCream.abs).resize({ width: 118 }).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: hex(DUO) } })
  .composite([{ input: touchIso, gravity: "center" }])
  .png()
  .toFile(`${SITE}/public/apple-touch-icon.png`);
say(`apple-touch-icon.png 180x180 (isotipo crema sobre verde DUO)`);

/* ── 4. og.jpg 1200x630 (hero + paleta nueva + marca principal crema) ── */
const hero = await sharp(`${SITE}/src/assets/hero-reformer-1400.webp`)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .toBuffer();
const mask = Buffer.from(
  `<svg width="1200" height="630"><rect width="1200" height="630" fill="${DUO}" fill-opacity="0.68"/></svg>`,
);
const wordOg = await sharp(await withPadBuf(wordCream, 0.1))
  .resize({ width: 520 })
  .png()
  .toBuffer();
const ogMeta = await sharp(wordOg).metadata();
await sharp(hero)
  .composite([{ input: mask, top: 0, left: 0 }, { input: wordOg, gravity: "center" }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(`${SITE}/public/og.jpg`);
say(`public/og.jpg 1200x630, marca ${ogMeta.width}x${ogMeta.height} centrada (${fs.statSync(`${SITE}/public/og.jpg`).size} B)`);
console.log("OK");

async function withPadBuf(k, padRatio) {
  const pad = Math.round(k.h * padRatio);
  return sharp(k.buf)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}
