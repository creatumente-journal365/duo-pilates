/**
 * Optimizador de fotos de Duo Pilates Studio.
 *
 * CÓMO SE CORRE (desde la raíz del repo):
 *   bun run optimize:images
 *
 * QUÉ HACE
 *   1. Lee los originales de `src/assets/raw/` (los archivos pesados tal como
 *      llegan del fotógrafo/cliente; NO se importan desde el código, así que no
 *      entran al bundle).
 *   2. Escribe variantes WebP de 2 anchos en `src/assets/` con nombres fijos
 *      (ver MANIFEST) — esos sí se importan desde `src/routes/index.tsx`.
 *   3. Recorta el hero a 1200x630 y lo guarda como `public/og.jpg` para el
 *      preview de WhatsApp (ruta estable, se copia tal cual al build).
 *   4. Falla (exit 1) si algún archivo supera el presupuesto de peso.
 *
 * PARA REEMPLAZAR LAS FOTOS POR LAS REALES
 *   Copia las nuevas a `src/assets/raw/` con los MISMOS nombres de archivo
 *   (hero-reformer.<ext>, duo-together.<ext>, besties.<ext> — .jpg/.jpeg/.png)
 *   y vuelve a correr el script. Los nombres de salida no cambian, así que el
 *   código no hay que tocarlo.
 */
import { mkdirSync } from "node:fs";
import { stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dir, "..");
const RAW_DIR = join(ROOT, "src", "assets", "raw");
const OUT_DIR = join(ROOT, "src", "assets");
const PUBLIC_DIR = join(ROOT, "public");

/** Calidad WebP. ~72 es el punto donde estas fotos dejan de verse mal. */
const WEBP_QUALITY = 72;
/** Calidad JPEG del og:image (WhatsApp lo re-comprime igual). */
const OG_QUALITY = 80;

type Target = {
  /** Nombre del original dentro de src/assets/raw (sin extensión). */
  slug: string;
  /** Anchos a generar, de menor a mayor. */
  widths: number[];
  /** Máximo de KB permitido para el archivo MÁS GRANDE generado. */
  budgetKB: number;
};

const MANIFEST: Target[] = [
  { slug: "hero-reformer", widths: [800, 1400], budgetKB: 350 },
  { slug: "duo-together", widths: [700, 1100], budgetKB: 200 },
  { slug: "besties", widths: [320, 480], budgetKB: 200 },
];

/** `public/og.jpg` — recorte 1200x630 del hero para la preview al compartir. */
const OG = { slug: "hero-reformer", width: 1200, height: 630, budgetKB: 300 };

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

async function findRaw(slug: string): Promise<string> {
  for (const ext of EXTENSIONS) {
    const candidate = join(RAW_DIR, `${slug}${ext}`);
    try {
      await stat(candidate);
      return candidate;
    } catch {
      /* sigue buscando */
    }
  }
  throw new Error(
    `No encontré el original de "${slug}" en src/assets/raw/ ` +
      `(extensiones aceptadas: ${EXTENSIONS.join(", ")}).`,
  );
}

const kb = (bytes: number) => Math.round(bytes / 1024);

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(PUBLIC_DIR, { recursive: true });

  let failed = false;
  const report: string[] = [];

  for (const target of MANIFEST) {
    const raw = await findRaw(target.slug);
    const meta = await sharp(raw).metadata();
    if (!meta.width || !meta.height) {
      throw new Error(`No pude leer las dimensiones de ${raw}`);
    }

    const seen = new Set<number>();
    let largest = 0;

    for (const requested of target.widths) {
      // Nunca hacemos upscale: si el original es más chico, usamos su ancho.
      const width = Math.min(requested, meta.width);
      if (seen.has(width)) continue;
      seen.add(width);

      const outPath = join(OUT_DIR, `${target.slug}-${width}.webp`);
      const buffer = await sharp(raw)
        // `withoutEnlargement` por si el original vuelve a ser menor al pedido.
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY, effort: 5 })
        .toBuffer();
      await writeFile(outPath, buffer);

      const size = buffer.byteLength;
      largest = Math.max(largest, size);
      report.push(
        `  ✓ ${target.slug}-${width}.webp  ${meta.width}x${meta.height} → ${width}px  ${kb(size)} KB`,
      );
    }

    if (largest > target.budgetKB * 1024) {
      failed = true;
      report.push(
        `  ✗ PRESUPUESTO: ${target.slug} pesa ${kb(largest)} KB (máx ${target.budgetKB} KB)`,
      );
    }
  }

  const ogRaw = await findRaw(OG.slug);
  const ogBuffer = await sharp(ogRaw)
    .resize({
      width: OG.width,
      height: OG.height,
      fit: "cover",
      // Un poco por encima del centro: en el hero la acción está en el tercio
      // medio-alto, no en el borde inferior.
      position: "north",
    })
    .jpeg({ quality: OG_QUALITY, mozjpeg: true })
    .toBuffer();
  const ogPath = join(PUBLIC_DIR, "og.jpg");
  await writeFile(ogPath, ogBuffer);
  report.push(`  ✓ public/og.jpg  ${OG.width}x${OG.height}  ${kb(ogBuffer.byteLength)} KB`);
  if (ogBuffer.byteLength > OG.budgetKB * 1024) {
    failed = true;
    report.push(`  ✗ PRESUPUESTO: og.jpg pesa ${kb(ogBuffer.byteLength)} KB (máx ${OG.budgetKB} KB)`);
  }

  console.log(report.join("\n"));
  if (failed) {
    console.error("\nAlgún archivo supera el presupuesto. Baja WEBP_QUALITY y vuelve a correr.");
    process.exit(1);
  }
  console.log("\nListo.");
}

await main();
