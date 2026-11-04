import pymupdf
doc = pymupdf.open("manual-marca-duo.pdf")
page = doc[12]
seen = {}
for d in page.get_drawings():
    r = d["rect"]
    area = r.width * r.height
    if area > 20000:
        f = d.get("fill")
        if f:
            hexv = "#%02X%02X%02X" % tuple(round(c*255) for c in f)
            seen.setdefault(hexv, []).append((round(area), round(r.x0), round(r.y0)))
for k, v in sorted(seen.items(), key=lambda kv: -max(a for a,_,_ in kv[1])):
    print(k, "puntos:", len(v), "área máx:", max(a for a,_,_ in v))
