"""Recaptura las capturas del centro de ayuda (public/help/) desde el servidor
demo en localhost:3000, con branding Atribuya y datos de ejemplo. Oculta el
indicador de Next dev. Solo cubre las pantallas reales de la app; 01 (email) y
06 (diagrama de flujo) no son páginas y se gestionan aparte."""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "public/help"

# (ruta, fichero). 04 se resuelve navegando al primer cliente.
PAGES = [
    ("/panel", "02-panel-sales.png"),
    ("/clientes", "03-clientes-lista.png"),
    ("/panel/enlace", "05-qr-modal.png"),
    ("/panel/resenas", "07-mis-resenas.png"),
    ("/panel", "08-boton-sincronizar.png"),
    ("/perfil", "09-perfil.png"),
]

HIDE_DEV = """
  [data-next-badge-root], nextjs-portal, #__next-build-watcher,
  [data-nextjs-dev-tools-button], [data-nextjs-toast] { display:none !important; }
"""

def shoot(page, path, out):
    page.goto(BASE + path, wait_until="networkidle")
    page.add_style_tag(content=HIDE_DEV)
    page.wait_for_timeout(600)
    page.screenshot(path=f"{OUT}/{out}")
    print(f"  {out}  <- {path}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page = ctx.new_page()

    for path, out in PAGES:
        shoot(page, path, out)

    # 04 — detalle de un cliente demo conocido.
    shoot(page, "/clientes/lucia-marin", "04-cliente-detalle-share.png")

    browser.close()
print("done")
