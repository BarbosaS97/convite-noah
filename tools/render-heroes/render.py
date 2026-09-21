"""Renderiza os heróis chibi 3D -> PNG transparente (out/) e WebP otimizado (public/assets/heroes/).

Requisitos (apenas para RE-gerar as imagens; NÃO é necessário para publicar o convite):
    pip install playwright pillow && playwright install chromium
Uso:
    python render.py            # todos
    python render.py spiderman  # só um
"""
import base64, functools, http.server, os, sys, threading
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
OUT = HERE / "out"
PUB = HERE.parent.parent / "public" / "assets" / "heroes"
OUT.mkdir(exist_ok=True); PUB.mkdir(parents=True, exist_ok=True)

# yaw > 0 vira o herói para a sua esquerda da tela (olha para a direita/centro); yaw < 0 o contrário
HEROES = {
    "spiderman": 0.32,
    "ironman": 0.28,
    "hulk": 0.22,
    "batman": 0.3,
    "captain": -0.3,
    "thor": -0.3,
    "panther": -0.3,
}

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    handler = functools.partial(Quiet, directory=str(HERE))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main(names):
    srv = serve(); port = srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        for n in names:
            page = b.new_page(viewport={"width": 900, "height": 1050})
            logs = []
            page.on("console", lambda m: logs.append(m.text))
            page.on("pageerror", lambda e: logs.append("PAGEERROR " + str(e)))
            page.goto(f"http://127.0.0.1:{port}/render.html?hero={n}&yaw={HEROES[n]}")
            try:
                page.wait_for_function("window.__ready === true", timeout=60000)
            except Exception:
                print(n, "TIMEOUT", logs); page.close(); continue
            data = page.evaluate("document.getElementById('c').toDataURL('image/png')")
            page.close()
            png = OUT / f"{n}.png"
            png.write_bytes(base64.b64decode(data.split(",", 1)[1]))
            im = Image.open(png).convert("RGBA")
            im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
            # margem mínima e altura padrão de 1000 px no master
            pad = 12
            canvas = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0)); canvas.paste(im, (pad, pad))
            canvas.save(png, optimize=True)
            web = canvas.copy(); web.thumbnail((720, 900), Image.LANCZOS)
            web.save(PUB / f"{n}.webp", "WEBP", quality=88, method=6)
            print(f"{n}: master {canvas.size} -> web {web.size}, {(PUB / f'{n}.webp').stat().st_size // 1024} KB", logs[:3])
        b.close()
    srv.shutdown()

if __name__ == "__main__":
    main(sys.argv[1:] or list(HEROES))
