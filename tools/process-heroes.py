"""Remove o fundo das imagens dos heróis e gera os WebP transparentes usados no convite.

Entrada : tools/heroes-originais/<nome>.(jfif|jpg|jpeg|png|webp)      (as imagens que você forneceu)
Saída   : public/assets/heroes/<nome>.webp  e  <nome>-s.webp (versão leve p/ celular)

Método  : preenchimento (flood-fill) a partir das bordas sobre pixels claros e neutros
          (branco / cinza do "xadrez" falso de transparência). Contornos pretos e brancos
          internos (olhos, brilhos) são preservados porque não encostam na borda.
Requer  : pip install opencv-python numpy pillow
Uso     : python tools/process-heroes.py            (todos)
          python tools/process-heroes.py hulk       (só um)
"""
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "heroes-originais"
DST = ROOT / "public" / "assets" / "heroes"
EXTRA = {"captain": ROOT / "tools" / "render-heroes" / "out" / "captain.png"}  # sem arquivo do usuário -> render 3D
ORDER = ["spiderman", "ironman", "hulk", "batman", "captain", "thor", "panther"]
OPTS = {
    "hulk": {"shadow": True},          # remove a sombra cinza no chão
}


def find_source(name):
    for ext in ("png", "webp", "jfif", "jpg", "jpeg"):
        p = SRC / f"{name}.{ext}"
        if p.exists():
            return p
    return EXTRA.get(name)


def border_components(mask):
    """Componentes (4-conectados) de `mask` que encostam em qualquer borda."""
    n, lab = cv2.connectedComponents(mask.astype(np.uint8), connectivity=4)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    edge = edge[edge != 0]
    return np.isin(lab, edge)


def remove_bg(rgb, shadow=False):
    f = rgb.astype(np.int16)
    sat = f.max(2) - f.min(2)
    lum = f.mean(2)
    bg = border_components((sat < 26) & (lum > 168))
    if shadow:  # sombra cinza (neutra, média) colada ao fundo já removido, na parte de baixo
        h = rgb.shape[0]
        neutral = (sat < 22) & (lum > 70) & (lum <= 200)
        neutral[: int(h * 0.62)] = False
        n, lab = cv2.connectedComponents(neutral.astype(np.uint8), connectivity=4)
        touching = cv2.dilate(bg.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        ids = np.unique(lab[touching & neutral]); ids = ids[ids != 0]
        bg |= np.isin(lab, ids)
    fg = ~bg
    # remove poeira: componentes minúsculos do primeiro plano
    n, lab, stats, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8), connectivity=8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 60:
            fg[lab == i] = False
    # fecha buracos internos pequenos que não são fundo (mantém olhos/brilhos)
    alpha = fg.astype(np.uint8) * 255
    # tira 1px de franja clara e suaviza a borda
    alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), iterations=1)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
    return alpha


def process(name):
    src = find_source(name)
    if src is None:
        print(f"{name}: SEM ARQUIVO (coloque em tools/heroes-originais/{name}.png)")
        return
    im = Image.open(src).convert("RGBA")
    rgb = np.array(im.convert("RGB"))
    a_src = np.array(im.getchannel("A"))
    if a_src.min() < 250:                       # já tem transparência real: mantém
        alpha = a_src
        how = "transparência original"
    else:
        alpha = remove_bg(rgb, **OPTS.get(name, {}))
        how = "fundo removido"
    out = np.dstack([rgb, alpha])
    ys, xs = np.where(alpha > 10)
    pad = 6
    y0, y1, x0, x1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, out.shape[0]), max(xs.min() - pad, 0), min(xs.max() + pad + 1, out.shape[1])
    img = Image.fromarray(out[y0:y1, x0:x1], "RGBA")
    # limita ao tamanho útil (não amplia imagens pequenas)
    img.thumbnail((720, 900), Image.LANCZOS)
    DST.mkdir(parents=True, exist_ok=True)
    img.save(DST / f"{name}.webp", "WEBP", quality=90, method=6)
    small = img.copy(); small.thumbnail((360, 480), Image.LANCZOS)
    sp = DST / f"{name}-s.webp"
    if small.size != img.size:
        small.save(sp, "WEBP", quality=88, method=6)
    elif sp.exists():
        sp.unlink()                       # imagem já é pequena: sem variante -s
    print(f"{name}: {src.name} ({how}) -> {img.size[0]}x{img.size[1]}  {(DST / f'{name}.webp').stat().st_size // 1024} KB  | -s {'sim' if sp.exists() else 'não'}")


if __name__ == "__main__":
    for n in (sys.argv[1:] or ORDER):
        process(n)
