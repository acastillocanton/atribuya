"""Captura las pantallas del ADMIN para la landing comercial (public/landing/),
desde el servidor demo en localhost:3000, con branding Atribuya y datos de
ejemplo. Oculta el indicador de Next dev. Complementa a capture-help.py (que
cubre el panel del comercial).

Cómo usar:
  NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run dev
  python3 scripts/capture-landing.py

Las pantallas del comercial (enlace-qr.png, mis-resenas.png) se reutilizan de
public/help/ y no se regeneran aqui. La cola de verificacion (/resenas/
verificacion) NO tiene modo demo, asi que no se captura.
"""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "public/landing"

# (ruta, fichero). Admin (dashboard, ranking) + comercial (enlace, reseñas),
# todas con soporte de modo demo. La cola de verificación (/resenas/
# verificacion) NO tiene modo demo, así que no se captura.
PAGES = [
    ("/dashboard", "dashboard.png"),
    ("/ranking", "ranking.png"),
    ("/panel/enlace", "enlace-qr.png"),
    ("/panel/resenas", "mis-resenas.png"),
]

HIDE_DEV = """
  [data-next-badge-root], nextjs-portal, #__next-build-watcher,
  [data-nextjs-dev-tools-button], [data-nextjs-toast] { display:none !important; }
"""

# El modo demo pinta avisos de "sin Supabase" (chrome de desarrollo, no parte
# del producto). Para la landing los limpiamos: el dato sigue siendo de ejemplo
# y la landing lo declara, pero la pantalla representa el producto real, sin el
# cartel de "configura .env.local".
CLEAN_DEMO = r"""
() => {
  const replacements = [
    ['Modo demo · sin Supabase', 'Resumen del equipo'],
    ['Datos de ejemplo', 'Últimos 12 meses'],
    ['Producción del equipo · datos de ejemplo', 'Producción del equipo'],
    ['Leaderboard (demo)', 'Leaderboard'],
    ['Reseñas recientes (demo)', 'Reseñas recientes'],
  ];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walk.nextNode()) nodes.push(walk.currentNode);
  nodes.forEach((n) => {
    const t = (n.nodeValue || '').trim();
    for (const [a, b] of replacements) if (t === a) n.nodeValue = n.nodeValue.replace(a, b);
    // El host de desarrollo no debe verse en la landing: localhost:3000 -> atribuya.com
    if (n.nodeValue && n.nodeValue.includes('localhost:3000')) {
      n.nodeValue = n.nodeValue.replaceAll('localhost:3000', 'atribuya.com');
    }
  });
  // Los <textarea>/<input> guardan el texto en .value (no es nodo de texto):
  // limpiar también el host de desarrollo ahí (plantilla de mensaje, etc.).
  document.querySelectorAll('textarea, input').forEach((el) => {
    if (el.value && el.value.includes('localhost:3000')) {
      el.value = el.value.replaceAll('localhost:3000', 'atribuya.com');
    }
  });

  // Tarjeta "Modo demostración ... .env.local" del dashboard: borrar entera.
  const note = [...document.querySelectorAll('div')].find((e) => {
    const t = (e.textContent || '').trim();
    return t.startsWith('Modo demostración') && t.includes('.env.local');
  });
  if (note) {
    const scroller = [...document.querySelectorAll('div')].find(
      (e) => e.style && e.style.overflow === 'auto' && (e.style.padding || '').includes('24px'),
    );
    if (scroller && scroller.firstElementChild) scroller.firstElementChild.remove();
    else note.remove();
  }
  // Aviso de datos de ejemplo del ranking.
  const rnote = [...document.querySelectorAll('p')].find((e) =>
    (e.textContent || '').trim().startsWith('Datos de ejemplo (modo demo'),
  );
  if (rnote) rnote.remove();
}
"""

def shoot(page, path, out):
    page.goto(BASE + path, wait_until="networkidle")
    page.add_style_tag(content=HIDE_DEV)
    page.evaluate(CLEAN_DEMO)
    page.wait_for_timeout(400)
    page.screenshot(path=f"{OUT}/{out}")
    print(f"  {out}  <- {path}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
    page = ctx.new_page()

    for path, out in PAGES:
        shoot(page, path, out)

    browser.close()
print("done")
