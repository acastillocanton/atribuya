# Capturas de la landing comercial

Estas imágenes se muestran en la landing pública (`app/page.tsx` ES y
`app/en/page.tsx` EN), en la sección «Cómo funciona» y en «Ver Atribuya por
dentro». Las pinta `components/landing/ProductShot.tsx` (con marco de navegador
y lightbox). El «clip» del paso 03 (la atribución resolviéndose) NO es un vídeo:
es una animación en CSS, `components/landing/AttributionAnimation.tsx`, así que
no hay ningún `.mp4` que generar ni alojar.

A diferencia de `public/help/` (manual interno del comercial), estas son de cara
al cliente: mezcla de pantallas del **admin** (el que compra) y del **comercial**.

## Ficheros

| Fichero | Pantalla | Ruta capturada | Uso en la landing |
|---|---|---|---|
| `dashboard.png` | Dashboard del admin (resumen del equipo) | `/dashboard` | Showcase (ancho completo) |
| `ranking.png` | Ranking del equipo | `/ranking` | Showcase (ancho completo) |
| `enlace-qr.png` | Enlace + QR del comercial | `/panel/enlace` | Showcase |
| `mis-resenas.png` | Reseñas atribuidas al comercial | `/panel/resenas` | Showcase |

Todas 2880×1800 (viewport 1440×900 @2x). `next/image` ya las sirve optimizadas
(WebP/AVIF) según el navegador, así que no hace falta precomprimir.

## Cómo regenerarlas

Desde el **modo demo** (sin Supabase), con Playwright:

```bash
NEXT_PUBLIC_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_ANON_KEY= npm run dev
python3 scripts/capture-landing.py
```

El script (`scripts/capture-landing.py`) limpia el chrome de desarrollo del modo
demo antes de disparar: oculta el aviso «Modo demo · sin Supabase» y la tarjeta
«configura .env.local», quita los sufijos «(demo)» de los títulos y sustituye el
host `localhost:3000` por `atribuya.com` (en textos y en el value de los
`<textarea>`). El dato sigue siendo de ejemplo (la landing lo declara), pero la
pantalla representa el producto real.

Solo se capturan rutas con modo demo. La cola de verificación
(`/resenas/verificacion`) NO tiene modo demo y no se captura aquí.

## El «clip» del paso 03

Es la animación `components/landing/AttributionAnimation.tsx` (CSS en bucle):
una reseña de Google entra sin el nombre del comercial y se atribuye sola a un
comercial. No hay vídeo que producir ni mantener. Respeta
`prefers-reduced-motion` (muestra el estado final fijo). Para retocar el texto o
los tiempos, edita ese componente.
