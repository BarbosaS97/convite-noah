"""Gera public/assets/images/poster.webp (fallback/poster do vídeo) e poster.jpg (prévia do WhatsApp/redes)
a partir de tools/poster.html.   Requer: pip install playwright pillow && playwright install chromium"""
import subprocess, sys, threading, time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)
PORT = 8765

srv = subprocess.Popen([sys.executable, str(ROOT / "tools" / "serve.py"), str(PORT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 720})
        pg.goto(f"http://127.0.0.1:{PORT}/tools/poster.html")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(1500)
        png = OUT / "_poster.png"
        pg.screenshot(path=str(png))
        b.close()
finally:
    srv.terminate()

im = Image.open(png).convert("RGB")
im.save(OUT / "poster.webp", "WEBP", quality=84, method=6)
im.save(OUT / "poster.jpg", "JPEG", quality=88, optimize=True)
png.unlink()
print("ok:", [(f.name, f.stat().st_size // 1024) for f in OUT.iterdir()])
