"""Graba el VIDEO de demostración del producto para la landing
(public/landing/demo-<locale>.{mp4,webm} + demo-poster-<locale>.jpg), desde el
servidor demo en localhost:3000. Recorre la app en modo demo (datos de ejemplo,
sin login), con un rotulo superpuesto por escena. Silencioso, pensado para
autoplay en bucle en la landing.

Cómo usar:
  NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run dev
  python3 scripts/capture-demo.py            # ambos idiomas
  python3 scripts/capture-demo.py --locale es

Requisitos: ffmpeg en el PATH (brew install ffmpeg). Playwright (ya instalado).

Notas:
  - device_scale_factor=1 a propósito: en VIDEO el 2x no aporta nitidez util y
    dispara el peso del fichero.
  - Reutiliza la limpieza de chrome de desarrollo de capture-landing.py
    (HIDE_DEV + CLEAN_DEMO) para que el clip represente el producto, no el modo dev.
  - El flujo publico (reseña real en Google) no se graba: requiere datos reales y
    sale del modo demo. La escena 2 lo cubre con un rotulo, igual que la animacion
    CSS de la landing.
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "public/landing"
W, H = 1440, 900

HIDE_DEV = """
  [data-next-badge-root], nextjs-portal, #__next-build-watcher,
  [data-nextjs-dev-tools-button], [data-nextjs-toast] { display:none !important; }
"""

# El modo demo pinta avisos de "sin Supabase" (chrome de desarrollo, no parte del
# producto). Los limpiamos: el dato sigue siendo de ejemplo pero la pantalla
# representa el producto real. (Basado en capture-landing.py, pero aquí grabamos
# varios segundos por escena y React re-renderiza algunas páginas, deshaciendo el
# parche de texto. Por eso instalamos un MutationObserver que re-aplica la
# limpieza ante cualquier cambio del DOM.)
CLEAN_INSTALL = r"""
() => {
  const replacements = [
    ['Modo demo · sin Supabase', 'Resumen del equipo'],
    ['Datos de ejemplo', 'Últimos 12 meses'],
    ['Producción del equipo · datos de ejemplo', 'Producción del equipo'],
    ['Leaderboard (demo)', 'Leaderboard'],
    ['Reseñas recientes (demo)', 'Reseñas recientes'],
  ];
  function clean() {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach((n) => {
      const t = (n.nodeValue || '').trim();
      for (const [a, b] of replacements) if (t === a) n.nodeValue = n.nodeValue.replace(a, b);
      if (n.nodeValue && n.nodeValue.includes('localhost:3000')) {
        n.nodeValue = n.nodeValue.replaceAll('localhost:3000', 'atribuya.com');
      }
    });
    document.querySelectorAll('textarea, input').forEach((el) => {
      if (el.value && el.value.includes('localhost:3000')) {
        el.value = el.value.replaceAll('localhost:3000', 'atribuya.com');
      }
    });
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
    const rnote = [...document.querySelectorAll('p')].find((e) =>
      (e.textContent || '').trim().startsWith('Datos de ejemplo (modo demo'),
    );
    if (rnote) rnote.remove();
  }
  clean();
  if (window.__atrCleanObs) window.__atrCleanObs.disconnect();
  let scheduled = false;
  const obs = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; clean(); });
  });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.__atrCleanObs = obs;
}
"""

# Inserta (una vez) el banner de rotulo fijo, con estilo de marca.
CAPTION_INIT = r"""
() => {
  if (document.getElementById('__atr_cap')) return;
  const el = document.createElement('div');
  el.id = '__atr_cap';
  el.style.cssText = [
    'position:fixed', 'left:50%', 'bottom:36px', 'transform:translateX(-50%)',
    'z-index:2147483647', 'display:flex', 'align-items:center', 'gap:12px',
    'padding:14px 22px', 'border-radius:9999px', 'background:#1D1D1F',
    'color:#fff', 'font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif',
    'font-size:19px', 'font-weight:600', 'letter-spacing:-0.01em',
    'box-shadow:0 10px 40px rgba(0,0,0,0.28)', 'opacity:0',
    'transition:opacity .45s ease', 'pointer-events:none', 'max-width:80vw',
    'white-space:nowrap',
  ].join(';');
  const dot = document.createElement('span');
  dot.style.cssText = 'width:9px;height:9px;border-radius:9999px;background:#2D7D46;flex:none';
  const txt = document.createElement('span');
  txt.id = '__atr_cap_txt';
  el.appendChild(dot);
  el.appendChild(txt);
  document.body.appendChild(el);
}
"""

CAPTION_SET = "(t) => { const e=document.getElementById('__atr_cap_txt'); const w=document.getElementById('__atr_cap'); if(e){e.textContent=t;} if(w){w.style.opacity='1';} }"
CAPTION_HIDE = "() => { const w=document.getElementById('__atr_cap'); if(w){w.style.opacity='0';} }"

# La app desplaza un contenedor interno (overflow:auto), no la ventana. Localiza
# el mayor scrollable y guárdalo; luego desplaza por fracción de su altura útil.
SCROLL_SETUP = r"""
() => {
  const cands = [...document.querySelectorAll('*')].filter((el) => {
    const s = getComputedStyle(el);
    return (s.overflowY === 'auto' || s.overflowY === 'scroll') &&
           el.scrollHeight > el.clientHeight + 40;
  });
  cands.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight));
  window.__atrScroller = cands[0] || document.scrollingElement || document.documentElement;
}
"""
SMOOTH_SCROLL = r"""
(frac) => {
  const el = window.__atrScroller || document.scrollingElement || document.documentElement;
  const max = Math.max(0, el.scrollHeight - el.clientHeight);
  el.scrollTo({ top: max * frac, behavior: 'smooth' });
}
"""

CAPTIONS = {
    "es": {
        "enlace": "Cada comercial tiene su enlace y su QR",
        "deja": "El cliente deja la reseña en Google",
        "asigna": "Atribuya la asigna sola al comercial",
        "admin": "El admin ve a todo el equipo de un vistazo",
        "ranking": "Y el ranking del equipo, en tiempo real",
    },
    "en": {
        "enlace": "Each rep gets their own link and QR",
        "deja": "The customer leaves the review on Google",
        "asigna": "Atribuya assigns it to the rep, on its own",
        "admin": "Admins see the whole team at a glance",
        "ranking": "And the team ranking, in real time",
    },
}


def hold(page, ms):
    page.wait_for_timeout(ms)


def goto(page, path):
    page.goto(BASE + path, wait_until="networkidle")
    page.add_style_tag(content=HIDE_DEV)
    page.evaluate(CLEAN_INSTALL)
    page.evaluate(SCROLL_SETUP)
    page.evaluate(CAPTION_INIT)
    hold(page, 600)


def scene(page, caption, first=False):
    # Fundido limpio: ocultar el rótulo anterior, cambiar texto, mostrar. Evita el
    # solape de dos textos durante la transición de opacidad.
    if not first:
        page.evaluate(CAPTION_HIDE)
        hold(page, 350)
    page.evaluate(CAPTION_SET, caption)


def record_locale(p, locale, tmpdir):
    caps = CAPTIONS[locale]
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(
        viewport={"width": W, "height": H},
        device_scale_factor=1,
        record_video_dir=tmpdir,
        record_video_size={"width": W, "height": H},
    )
    page = ctx.new_page()

    # Escena 1 — comercial: enlace + QR
    goto(page, "/panel/enlace")
    scene(page, caps["enlace"], first=True)
    page.evaluate(SMOOTH_SCROLL, 0)
    hold(page, 2400)
    page.mouse.move(W * 0.29, H * 0.55)  # hover sobre el QR
    page.evaluate(SMOOTH_SCROLL, 0.5)
    hold(page, 2600)

    # Escena 2 — comercial: la reseña entra (lista de reseñas)
    goto(page, "/panel/resenas")
    scene(page, caps["deja"])
    page.evaluate(SMOOTH_SCROLL, 0)
    hold(page, 2600)
    page.evaluate(SMOOTH_SCROLL, 0.35)
    hold(page, 2400)

    # Escena 3 — comercial: atribuida con % de confianza (hover en una fila)
    scene(page, caps["asigna"])
    page.evaluate(SMOOTH_SCROLL, 0.15)
    hold(page, 1000)
    page.mouse.move(W * 0.5, H * 0.45)
    hold(page, 3000)

    # Escena 4 — admin: dashboard
    goto(page, "/dashboard")
    scene(page, caps["admin"])
    page.evaluate(SMOOTH_SCROLL, 0)
    hold(page, 2600)
    page.evaluate(SMOOTH_SCROLL, 0.6)
    hold(page, 2800)

    # Escena 5 — admin: ranking
    goto(page, "/ranking")
    scene(page, caps["ranking"])
    page.evaluate(SMOOTH_SCROLL, 0)
    hold(page, 2400)
    page.evaluate(SMOOTH_SCROLL, 1)
    hold(page, 2600)
    page.evaluate(CAPTION_HIDE)
    hold(page, 500)

    # Cerrar el contexto vuelca el webm
    raw_webm = page.video.path()
    ctx.close()
    browser.close()
    return raw_webm


def transcode(raw_webm, locale):
    mp4 = f"{OUT}/demo-{locale}.mp4"
    webm = f"{OUT}/demo-{locale}.webm"
    poster = f"{OUT}/demo-poster-{locale}.jpg"

    # mp4 H.264 (Safari/iOS + amplia compatibilidad), sin audio, faststart
    subprocess.run(
        ["ffmpeg", "-y", "-i", raw_webm,
         "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
         "-crf", "28", "-preset", "slow", "-movflags", "+faststart", "-an", mp4],
        check=True, capture_output=True,
    )
    # webm VP9 (tamaño)
    subprocess.run(
        ["ffmpeg", "-y", "-i", raw_webm,
         "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-an", webm],
        check=True, capture_output=True,
    )
    # poster (frame ~1.2s, ya con el primer rotulo visible)
    subprocess.run(
        ["ffmpeg", "-y", "-ss", "1.2", "-i", mp4, "-frames:v", "1", "-q:v", "3", poster],
        check=True, capture_output=True,
    )
    for f in (mp4, webm, poster):
        kb = os.path.getsize(f) // 1024
        print(f"  {f}  ({kb} KB)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--locale", choices=["es", "en"], help="solo un idioma (default: ambos)")
    args = ap.parse_args()

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg no encontrado en el PATH. Instala con: brew install ffmpeg")

    os.makedirs(OUT, exist_ok=True)
    locales = [args.locale] if args.locale else ["es", "en"]

    with sync_playwright() as p:
        for locale in locales:
            print(f"grabando {locale}…")
            with tempfile.TemporaryDirectory() as tmp:
                raw = record_locale(p, locale, tmp)
                transcode(raw, locale)
    print("done")


if __name__ == "__main__":
    main()
