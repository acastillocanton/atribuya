"""Genera public/help/06-flujo-atribucion.png (diagrama del flujo de atribución).

No es una pantalla de la app: es una ilustración. Renderiza
scripts/help-06-diagram.html con Playwright (mismas fuentes/paleta de marca que
la app) y captura el elemento #canvas a 2x. El logo se embebe en base64 para no
depender de rutas relativas.

Uso:  python3 scripts/capture-help-06.py
"""
import base64
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML = ROOT / "scripts" / "help-06-diagram.html"
LOGO = ROOT / "public" / "brand" / "logo-cuadrado.png"
OUT = ROOT / "public" / "help" / "06-flujo-atribucion.png"

logo_b64 = base64.b64encode(LOGO.read_bytes()).decode("ascii")
logo_uri = f"data:image/png;base64,{logo_b64}"
html = HTML.read_text(encoding="utf-8").replace("LOGO_SRC", logo_uri)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=2)
    page.set_content(html, wait_until="networkidle")
    # Dar tiempo a que las webfonts (Fraunces/Geist) se apliquen.
    page.wait_for_timeout(800)
    canvas = page.locator("#canvas")
    canvas.screenshot(path=str(OUT))
    browser.close()

print(f"OK -> {OUT}")
