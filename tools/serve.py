"""Servidor local simples para ver o convite:  python tools/serve.py  ->  http://localhost:8080
(Serve a pasta raiz do projeto. Suporta Range, necessário para o vídeo poder avançar/voltar.)"""
import http.server, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webp": "image/webp", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".js": "text/javascript"}

    def guess_type(self, path):
        t = super().guess_type(path)
        return t + "; charset=utf-8" if t.split("/")[0] == "text" or t in ("application/javascript", "application/json") else t

    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        rng = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not rng or not os.path.isfile(path):
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416); return None
        f = open(path, "rb"); f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._range_left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, "_range_left", None)
        if left is None:
            return super().copyfile(source, outputfile)
        while left > 0:
            chunk = source.read(min(65536, left))
            if not chunk: break
            try: outputfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError): break
            left -= len(chunk)
        self._range_left = None

    def log_message(self, *a): pass


if __name__ == "__main__":
    print(f"Convite do Noah em http://localhost:{PORT}  (Ctrl+C para parar)")
    http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
