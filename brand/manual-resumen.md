# Manual de marca DUO — resumen operativo para la web

Fuente: `manual-marca-duo.pdf` (28 páginas, entregado por el dueño el 2026-10-05).
Páginas renderizadas en `brand/paginas/pNN.jpg`. Texto extraído en `brand/manual-texto.txt`.
Logos en `brand/logos/logo-01..13.png` (2084×2084, PNG RGB, sin transparencia).

## Paleta (página 13)
La lámina trae **4 muestras pero solo 2 códigos** (error de plantilla del manual: el hex y el
RGB de `WARM UP` y `SPICY` están repetidos y no corresponden a su color). Valores:

| Nombre | Declarado en el manual | Color real del arte (muestreado del vector) | Uso propuesto en la web |
|---|---|---|---|
| MORNING GLOW | `#F8F9DF` | `#FFF6EE` | Fondo claro principal (reemplaza el crema #F3EFE7) |
| BETTER TOGETHER | `#5C6038` | `#60693E` | Fondo oscuro principal + verde de marca |
| WARM UP | (sin código; dice `#F8F9DF` por error) | `#9C9D71` | Verde claro / salvia, detalles y fondos suaves |
| SPICY | (sin código; dice `#5C6038` por error) | `#7C4B29` | Acento terracota (paquete Duo Flow, stickers) |

- El arte del manual y los códigos escritos difieren en 1–3 puntos por muestra (probable
  conversión CMYK→RGB). Decisión para la web: usar los **códigos escritos** (`#5C6038`,
  `#F8F9DF`) y los **valores medidos del arte** (`#9C9D71`, `#7C4B29`) para las dos que no
  tienen código. Pedir al diseñador que confirme `WARM UP` y `SPICY`.
- Contrastes a vigilar: crema sobre `#5C6038` ✓; verde `#5C6038` sobre crema ✓;
  crema sobre salvia `#9C9D71` ✗ (~2.4:1) → sobre salvia va texto oscuro.

## Tipografía (página 14)
- Familia de marca: **Inter** — Bold / Medium / Regular. Es la única familia documentada.
- Fuentes incrustadas en el PDF: `Inter-Regular`, `Syne-Regular` y `BartleenScript`
  (estas dos últimas solo en la página 17, la de usos incorrectos = el logo).
  **Bartleen Script es la tipografía del logotipo** y `Syne` aparece en el descriptor
  "PILATES STUDIO". No son fuentes de texto para la web.
- Consecuencia: **fuera Archivo Black, Anton y Yellowtail**; todo el sitio pasa a Inter
  (Regular / Medium / Bold, y los pesos altos para titulares). El script solo existe
  dentro del logo (imagen), no como fuente web.

## Logo (páginas 9–12, 17)
- Marca principal = logotipo gestual "Duo" + descriptor "PILATES STUDIO".
- Isotipo = símbolo compacto (los dos puntos + el gesto) para usos reducidos: navbar, favicon, avatar.
- Versión **positiva** sobre fondos claros; versión **negativa** sobre fondos oscuros.
- Área de seguridad: dejar libre alrededor el tamaño del punto de la "o".
- Mapa de los 13 PNG entregados (orden del montaje `logo-grid.jpg`, 4 por fila):
  - 01 negro sobre blanco · 02 crema sobre blanco · 03 oliva oscuro sobre blanco · 04 oliva sobre blanco
  - 05 crema sobre oliva oscuro · 06 crema sobre salvia · 07 oliva sobre salvia · 08 salvia sobre oliva oscuro
  - 09–12 isotipo (negro / crema / salvia / oliva) sobre blanco · 13 isotipo crema sobre oliva oscuro
- **No vienen SVG ni PNG con transparencia**: son PNG RGB con fondo de color plano. Para la web hay
  que recortar el fondo (chroma-key del color plano) y exportar versiones con transparencia
  (crema, oliva, negro) + favicon. Conviene pedir los vectores originales (.svg/.ai) al diseñador.

## Estrategia y copy (páginas 3–8) — pendiente de decisión del dueño
- Concepto: `CONNECTION · BALANCE · MOVEMENT · TOGETHERNESS` y el lema **BETTER TOGETHER.**
- Pilares de marca (página 5), distintos de los 3 que publica la web hoy:
  BE KNOWN ("We know your name. And your springs.") · FEEL HELD ("We've got you.") ·
  GET PUSHED · FIND YOUR PEOPLE ("YOUR PILATES PEOPLE").
- Voz (página 6): "DUO VIBE." · "UNA MÁS, YOU GOT THIS." · "TU REFORMER TE EXTRAÑA. WE DO TOO." ·
  "PILATES FIRST, CHISME AFTER."
- Arquetipo: THE MAGICIAN. Personalidad: THE FRIEND WHO KNOWS YOUR SHIT.
- Otras secciones: patrón (15), ilustraciones orgánicas del cuerpo (16), moodboard (18),
  estilo fotográfico (19, espontáneo, con ligeros desenfoques), aplicaciones (20–27).
