# Runbook de onboarding de cliente

Checklist paso a paso para dar de alta un cliente en Atribuya, de cero a primera reseña atribuida. Es el guion del setup (129 €) y la referencia del proveedor (super_admin). Verificado E2E el 2026-07-30 (org AleCris, fichas reales por Vía B).

> Convención: **[P]** = lo hace el proveedor · **[C]** = lo hace el cliente (admin de la org), normalmente acompañado en la sesión de onboarding.

---

## Fase 0 — Antes de tocar nada (preventa)

1. **[P] Recopilar datos del cliente:**
   - Razón social, CIF/NIF, dirección fiscal (para el DPA y la ficha de la org en `/super`).
   - Email del que será **admin** de la org (no puede ser un email ya usado como super_admin).
   - Nº de fichas de Google y nº de comerciales + directores → decide el **plan**: `basic` (5 comerciales / 1 ficha, 45 €) · `standard` (15 / 3, 99 €) · `plus` (30 / 10, 199 €) · `custom`. Los directores ocupan plaza; los gestores no.
   - **Cuenta de Google que administra la(s) ficha(s)** en Business Profile (propietario o administrador en business.google.com). Sin esto no hay Vía B.
2. **[P] DPA firmado ANTES de conectar datos** (art. 28 RGPD: en cuanto sincronizamos sus reseñas somos encargado del tratamiento). Plantilla en `docs/legal/dpa.docx`: rellenar los corchetes del lado Cliente, firmar ambas partes, archivar. Aplica también a clientes de prueba.
3. **[P] Decidir estado inicial de la org**: `trial` (los crons procesan `active` y `trial` por igual; `trial` para pilotos, `active` al pasar a pago).

## Fase 1 — Alta técnica (proveedor, ~10 min)

4. **[P]** Login en `https://atribuya.com` con la cuenta super_admin → `/super`.
5. **[P]** **Crear organización**: nombre comercial, slug (definitivo: no se puede editar después), estado, plan, datos fiscales.
6. **[P]** **Invitar al admin** (bloque que aparece tras crear): nombre + email. Sale email automático por Brevo; la pantalla muestra además el **enlace de invitación de respaldo**: cópialo siempre (si el email tarda o cae en spam, se lo pasas por WhatsApp).

## Fase 2 — Activación del admin (cliente, ~20 min, mejor en videollamada)

7. **[C]** Abrir la invitación → aceptar → login por **magic link**. Gotcha: el enlace del email debe abrirse **en el mismo dispositivo y navegador** desde el que se pidió.
8. **[C]** **Crear la ficha**: `/fichas` → Añadir ficha → asistente de 4 pasos (buscar el negocio en Google → elegir el candidato → confirmar → sincronizar). La Vía A trae el top-5 de reseñas al momento, así el cliente ve datos desde el minuto uno.
9. **[C]** **Conectar Google (Vía B)** en la ficha → botón «Conectar Google»:
   - Elegir la cuenta de Google **que administra la ficha** (no una personal cualquiera).
   - ⚠️ **EL GOTCHA IMPORTANTE**: en la pantalla de permisos de Google, la casilla «Ver, editar, crear y eliminar tus fichas de empresa» viene **desmarcada**. Hay que marcarla. Si se olvida, la conexión falla con un 403 al listar cuentas; se arregla repitiendo «Conectar Google» (el flujo siempre vuelve a preguntar).
   - Elegir la ficha en el selector (si la ficha creada tiene Place ID, sale preseleccionada).
   - La transición Vía A → Vía B se reconcilia sola: el cron reclama las reseñas del top-5 ya importadas y no quedan duplicados.
10. **[P]** Verificar la conexión por detrás: la ficha en `oauth_status='connected'` y, tras el siguiente sync (horario), las reseñas completas con `source='business_profile'`. Para no esperar, el proveedor puede lanzar el cron a mano: `curl -H "Authorization: Bearer $CRON_SECRET" https://atribuya.com/api/cron/sync-google-reviews`.

## Fase 3 — Equipo y reglas del juego (cliente, ~20 min)

11. **[C]** **Invitar comerciales** (`/comerciales`) y, si hay equipos por oficina, **directores** (`/directores`, requieren ficha asignada) y **gestores** de solo lectura (`/gestores`). Cada invitación manda email automático + enlace de respaldo en pantalla. El tope de plazas lo marca el plan; pausar un perfil libera plaza.
12. **[C]** Configurar por comercial (opcional pero recomendado si van a usar incentivos):
    - **Objetivo mensual** de reseñas.
    - **Comisión €** por reseña verificada. La tarifa de los meses cerrados queda congelada.
13. **[C]** Revisar las **plantillas de mensaje** (texto que el comercial envía con su enlace) y adaptarlas al tono de la empresa.

## Fase 4 — Primer circuito de atribución (la prueba de fuego)

Esta es la parte que valida el producto completo con datos reales. Hacerla con un comercial de verdad:

14. **[C·comercial]** Aceptar su invitación → entrar en `/panel` → **crear un cliente** (nombre real) → compartir el **enlace personalizado** o QR por WhatsApp.
15. **[cliente final]** Abre el enlace (redirige directo a «Escribir reseña» en Google) y deja su reseña.
16. **Verificar el circuito** (en el siguiente sync horario):
    - La reseña entra y el matcher la atribuye (`counted`) o la deja `pending`.
    - El comercial recibe su **email de reseña conseguida** (solo si está `active` y la reseña queda `counted`).
    - Si queda dudosa: el comercial la reclama con **«Es mía»** o el admin la resuelve en la cola de **Verificación**.
    - Si algún día entra una de **1-2★**: alerta inmediata por email a admin, gestores y comercial atribuido.

## Fase 5 — Vigilancia de la primera semana (proveedor)

- Revisar a diario el resultado de los crons (logs de Vercel o llamada manual): contadores `fetched / new / counted / pending / unmatched / migrated / swept` por ficha.
- Revisar `audit_log` buscando `notify_failed`, `insert_collision` y `places_leftover_conflict` (0 es lo esperado).
- **Helpdesk**: el cliente tiene `/soporte` en la app (los mensajes sin leer salen con badge en el sidebar del super_admin). Responder rápido; con un piloto, cada ticket es oro.
- Anotar el feedback del cliente → backlog de producto.

---

## Gotchas conocidos (chuleta)

| Síntoma | Causa | Solución |
|---|---|---|
| OAuth conecta pero «No hemos podido listar tus cuentas» (403) | Casilla de fichas de empresa sin marcar en el consent | Repetir «Conectar Google» y marcarla |
| «Esta cuenta no gestiona ninguna ficha» | La cuenta de Google elegida no es admin del Business Profile | Salir y conectar con la cuenta correcta (o darle acceso en business.google.com) |
| El magic link no crea sesión | Se abrió en otro dispositivo/navegador | Pedir nuevo enlace y abrirlo donde se solicitó |
| No llega el email de invitación | Spam o retardo de Brevo (Free, 300/día compartidos) | Usar el enlace de respaldo que muestra la pantalla |
| Solo se ven 5 reseñas | La ficha aún va por Vía A (sin OAuth) | Conectar Google (Vía B) |
| La reseña tarda en aparecer | El sync es horario (GitHub Actions, 06:30-23:30 UTC) | Esperar al siguiente tick o lanzar el cron a mano |
| El botón «Buscar mis reseñas» no trae nada en ficha conectada | `/api/sync/now` solo lanza la Vía A, que salta fichas con OAuth | Limitación conocida; el sync horario de la Vía B lo cubre (pendiente de mejora) |

## Checklist rápido (imprimible)

```
□ Datos del cliente (fiscal + email admin + cuenta Google de la ficha)
□ Plan elegido (basic/standard/plus/custom)
□ DPA firmado
□ Org creada en /super (slug definitivo)
□ Admin invitado (enlace de respaldo copiado)
□ Admin dentro (magic link OK)
□ Ficha creada (asistente, top-5 visible)
□ Google conectado (casilla marcada, ficha seleccionada)
□ Reseñas completas sincronizadas (source=business_profile)
□ Comerciales / directores / gestores invitados
□ Objetivos y comisiones configurados
□ Plantillas de mensaje revisadas
□ Primer enlace compartido con un cliente final real
□ Primera reseña atribuida + email al comercial
□ Semana 1 vigilada (crons + audit_log + soporte)
```
