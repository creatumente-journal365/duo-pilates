// Análisis de los PNG del logo: colores planos (fondo + arte) de cada archivo.
// Ejecutar desde /home/team/shared/site con: bun -e "$(cat /home/team/shared/brand/analyze-logos.mjs)"
// (bun <archivo>.mjs se cuelga con sharp en este entorno; bun -e funciona.)
import sharp from "sharp";
import fs from "node:fs";
const dir = "/home/team/shared/brand/logos";
const out = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".png")).sort()) {
  const { data, info } = await sharp(`${dir}/${f}`)
    .resize(520, 520, { kernel: "nearest" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const hist = new Map();
  const total = info.width * info.height;
  for (let i = 0; i < data.length; i += ch) {
    const k = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    hist.set(k, (hist.get(k) || 0) + 1);
  }
  const sorted = [...hist.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted
    .slice(0, 4)
    .map(([k, n]) => `#${k.toString(16).padStart(6, "0")}=${((n * 100) / total).toFixed(1)}%`);
  // colores con mas de 0.05% (los planos reales)
  const flats = sorted
    .filter(([, n]) => (n * 100) / total > 0.05)
    .map(([k, n]) => `#${k.toString(16).padStart(6, "0")}=${((n * 100) / total).toFixed(2)}%`);
  out.push(`${f} n=${hist.size} top: ${top.join(" ")} | flats(${flats.length}): ${flats.join(" ")}`);
}
fs.writeFileSync("/home/team/shared/brand/logos-analisis.txt", out.join("\n") + "\n");
console.log("done", out.length);
