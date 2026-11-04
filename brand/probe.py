import pymupdf
doc = pymupdf.open("manual-marca-duo.pdf")
# fuentes por página
for i, page in enumerate(doc):
    fs = sorted({f[3] for f in page.get_fonts(full=True)})
    if fs: print(f"p{i+1:02d}: {fs}")
print("---- colores muestreados en p13 (dpi 150) ----")
page = doc[12]
pix = page.get_pixmap(dpi=150)
W, H = pix.width, pix.height
pts = {"panel_izq (fondo)": (0.10, 0.85), "crema MORNING GLOW": (0.60, 0.12), "oliva claro WARM UP": (0.90, 0.12), "terracota SPICY": (0.90, 0.72), "fondo bajo BETTER TOGETHER": (0.75, 0.85)}
for name,(fx,fy) in pts.items():
    x, y = int(fx*W), int(fy*H)
    r,g,b = pix.pixel(x,y)[:3]
    print(f"{name:32s} #{r:02X}{g:02X}{b:02X}  rgb({r},{g},{b})")
