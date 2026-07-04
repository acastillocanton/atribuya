/**
 * Helpers de rango de fechas para los filtros del manager.
 *
 * Convención:
 *  - `from` y `to` son fechas naturales en formato `yyyy-mm-dd` (sin hora).
 *  - El rango incluye `from` y `to` enteros: si pides `from=2026-05-01` y
 *    `to=2026-05-31`, las queries usan `>= 2026-05-01T00:00 Madrid` y
 *    `< 2026-06-01T00:00 Madrid`.
 *  - Los atajos calculan rangos sobre meses naturales completos para que el
 *    parte mensual sea reproducible mes a mes.
 *
 * Zona horaria: TODO el cálculo (qué periodo/mes es "ahora", y los límites
 * `startIso`/`endIso` de las queries) se hace en `Europe/Madrid`, no en la TZ
 * del runtime (Vercel corre en UTC). Así el corte "día 20" y los meses
 * coinciden con las fechas que ve el usuario: una reseña de las 00:30 de Madrid
 * del día 20 (= 22:30 UTC del 19) cuenta en el periodo del 20, no en el
 * anterior. Se usa `Intl.DateTimeFormat` con `timeZone`, disponible en Node y
 * navegador (este módulo lo consumen componentes cliente).
 */

const TZ = "Europe/Madrid";

/** Fecha civil en Madrid (m 0-indexed). */
type Civil = { y: number; m: number; d: number };

/** Offset de Madrid en minutos para un instante (p. ej. 120 en verano/CEST). */
function madridOffsetMinutes(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  let hour = get("hour");
  if (hour === 24) hour = 0; // algunos entornos formatean medianoche como 24
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second"),
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Fecha civil (Y/M/D) en Madrid del instante dado. */
function madridCivil(instant: Date): Civil {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = dtf.formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { y: get("year"), m: get("month") - 1, d: get("day") };
}

/** ISO (UTC) del instante 00:00 hora de Madrid del día civil dado. La
 *  medianoche nunca cae en la transición DST (Madrid cambia a las 02:00/03:00),
 *  así que una única corrección por el offset es exacta. */
function madridMidnightIso(c: Civil): string {
  const guessUtc = Date.UTC(c.y, c.m, c.d, 0, 0, 0);
  const offset = madridOffsetMinutes(new Date(guessUtc));
  return new Date(guessUtc - offset * 60000).toISOString();
}

/** Normaliza una fecha civil (admite overflow/underflow de mes y día, p. ej.
 *  m=-1 → dic del año anterior; d=0 → último día del mes previo). TZ-independiente
 *  (usa aritmética UTC, sin `new Date(local)`). */
function civil(y: number, m: number, d: number): Civil {
  const dt = new Date(Date.UTC(y, m, d));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate() };
}

function civilCompare(a: Civil, b: Civil): number {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type DateRange = {
  /** Fecha de inicio inclusive, formato yyyy-mm-dd. */
  from: string;
  /** Fecha fin inclusive, formato yyyy-mm-dd. */
  to: string;
  /** ISO timestamp del inicio del rango (00:00 local del día `from`). */
  startIso: string;
  /** ISO timestamp del primer instante FUERA del rango (00:00 local del día siguiente a `to`). */
  endIso: string;
  /** Etiqueta legible para mostrar al usuario. */
  label: string;
  /** Slug compacto para nombres de archivo. */
  slug: string;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdCivil(c: Civil): string {
  return `${c.y}-${pad(c.m + 1)}-${pad(c.d)}`;
}

function isValidYmd(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const parts = s.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return false;
  const c = civil(y, m - 1, d);
  return c.y === y && c.m === m - 1 && c.d === d;
}

function parseYmdCivil(s: string): Civil {
  const parts = s.split("-").map(Number);
  // Asume formato pre-validado con isValidYmd: si llega aquí algo distinto
  // de 3 números válidos, es un bug del caller, no input externo.
  return civil(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

function buildRange(fromC: Civil, toC: Civil): DateRange {
  // Si llega invertido lo enderezamos para no devolver rangos vacíos.
  const [start, end] =
    civilCompare(fromC, toC) <= 0 ? [fromC, toC] : [toC, fromC];
  // Límites en hora de MADRID: 00:00 del día `from` y 00:00 del día siguiente
  // a `to` (primer instante fuera del rango).
  const startIso = madridMidnightIso(start);
  const endIso = madridMidnightIso(civil(end.y, end.m, end.d + 1));
  return {
    from: ymdCivil(start),
    to: ymdCivil(end),
    startIso,
    endIso,
    label: rangeLabel(start, end),
    slug: rangeSlug(start, end),
  };
}

function rangeLabel(from: Civil, to: Civil): string {
  // Caso "mes natural completo": del 1 al último día.
  const lastDayOfMonth = civil(from.y, from.m + 1, 0).d;
  if (from.d === 1 && from.m === to.m && from.y === to.y && to.d === lastDayOfMonth) {
    return `${MONTH_LABELS[from.m] ?? ""} ${from.y}`;
  }
  // Mismo año, dos meses naturales completos consecutivos no nos los
  // detallamos: tratamos cualquier otra cosa como rango libre.
  const fmt = (c: Civil) =>
    `${pad(c.d)} ${(MONTH_LABELS[c.m] ?? "").slice(0, 3)} ${c.y}`;
  return `${fmt(from)} – ${fmt(to)}`;
}

function rangeSlug(from: Civil, to: Civil): string {
  return `${ymdCivil(from)}_${ymdCivil(to)}`;
}

/** Mes natural en curso (día 1 → último día del mes actual). */
export function thisMonthRange(now = new Date()): DateRange {
  const c = madridCivil(now);
  return buildRange(civil(c.y, c.m, 1), civil(c.y, c.m + 1, 0));
}

/** Mes natural anterior completo. */
export function lastMonthRange(now = new Date()): DateRange {
  const c = madridCivil(now);
  return buildRange(civil(c.y, c.m - 1, 1), civil(c.y, c.m, 0));
}

/**
 * "Último trimestre": los 3 meses naturales completos anteriores al actual.
 * Si hoy es 21-may-2026 → desde 1-feb-2026 hasta 30-abr-2026. Pensado para
 * "ver lo del trimestre cerrado" para reporting.
 */
export function lastQuarterRange(now = new Date()): DateRange {
  const c = madridCivil(now);
  return buildRange(civil(c.y, c.m - 3, 1), civil(c.y, c.m, 0));
}

// ─── Periodo de comisión (20 → 19) ──────────────────────────────────────────
// A los comerciales se les liquida la comisión por periodos que van del día 20
// de un mes al día 19 del mes siguiente (el día 20 abre periodo nuevo, sin
// solapamientos). Es el rango protagonista en las pantallas del comercial. El
// día de corte (20) es fijo en todo el SaaS por ahora (no configurable por org).

/** Límites (Civil, en Madrid) del periodo de comisión vigente en `now`. */
function commissionPeriodBounds(now: Date): { from: Civil; to: Civil } {
  const c = madridCivil(now);
  const from = c.d >= 20 ? civil(c.y, c.m, 20) : civil(c.y, c.m - 1, 20);
  const to = civil(from.y, from.m + 1, 19);
  return { from, to };
}

/** Etiqueta compacta del periodo de comisión: "20 may – 19 jun" (año solo si difiere). */
function commissionLabel(from: Civil, to: Civil): string {
  const mon = (c: Civil) => (MONTH_LABELS[c.m] ?? "").slice(0, 3);
  if (from.y === to.y) {
    return `${from.d} ${mon(from)} – ${to.d} ${mon(to)}`;
  }
  return `${from.d} ${mon(from)} ${from.y} – ${to.d} ${mon(to)} ${to.y}`;
}

function commissionRange(from: Civil, to: Civil): DateRange {
  return { ...buildRange(from, to), label: commissionLabel(from, to) };
}

/** Periodo de comisión vigente (20 → 19 del mes siguiente). */
export function commissionPeriodRange(now = new Date()): DateRange {
  const { from, to } = commissionPeriodBounds(now);
  return commissionRange(from, to);
}

/** Periodo de comisión inmediatamente anterior al vigente. */
export function previousCommissionPeriodRange(now = new Date()): DateRange {
  const { from } = commissionPeriodBounds(now);
  const prevFrom = civil(from.y, from.m - 1, 20);
  const prevTo = civil(from.y, from.m, 19);
  return commissionRange(prevFrom, prevTo);
}

/** True si `range` coincide exactamente con el periodo de comisión vigente en `now`. */
export function isCommissionPeriod(range: DateRange, now = new Date()): boolean {
  const cur = commissionPeriodRange(now);
  return range.from === cur.from && range.to === cur.to;
}

/**
 * Parsea los query params `from` y `to` (yyyy-mm-dd). Si faltan, son
 * inválidos o vienen invertidos (`from > to`), cae al `fallback` (por defecto
 * el mes natural en curso). Las pantallas del comercial/gestión pasan
 * `commissionPeriodRange` como fallback para arrancar en el periodo de comisión.
 *
 * La UI (`RangePicker`) nunca produce rangos invertidos — la validación
 * defensiva es solo para URLs escritas a mano o copy/paste.
 */
export function parseRange(
  fromParam: string | null | undefined,
  toParam: string | null | undefined,
  now = new Date(),
  fallback: (now: Date) => DateRange = thisMonthRange,
): DateRange {
  if (fromParam && toParam && isValidYmd(fromParam) && isValidYmd(toParam)) {
    const from = parseYmdCivil(fromParam);
    const to = parseYmdCivil(toParam);
    if (civilCompare(from, to) > 0) {
      // Antes invertíamos silenciosamente en buildRange — confundía al
      // usuario porque la etiqueta no coincidía con lo que había escrito.
      // Mejor caer al fallback y que vuelva a elegir.
      return fallback(now);
    }
    return buildRange(from, to);
  }
  return fallback(now);
}

/**
 * Atajos pre-calculados listos para alimentar a un selector cliente. Devuelven
 * solo los datos serializables (no objetos `Date`), lo que evita errores de
 * "cannot be passed to client components".
 */
export type ShortcutDescriptor = {
  key: string;
  label: string;
  from: string;
  to: string;
  rangeLabel: string;
};

export function defaultShortcuts(now = new Date()): ShortcutDescriptor[] {
  const m = thisMonthRange(now);
  const lm = lastMonthRange(now);
  const lq = lastQuarterRange(now);
  return [
    { key: "this-month", label: "Mes actual", from: m.from, to: m.to, rangeLabel: m.label },
    { key: "last-month", label: "Mes pasado", from: lm.from, to: lm.to, rangeLabel: lm.label },
    {
      key: "last-quarter",
      label: "Último trimestre",
      from: lq.from,
      to: lq.to,
      rangeLabel: lq.label,
    },
  ];
}

/**
 * Atajos UNIFICADOS del `RangePicker` para las pantallas con comisión (comercial
 * + gestión): el periodo de comisión vigente y el anterior van primero (son los
 * relevantes para la liquidación), seguidos del mes natural / mes pasado y del
 * último trimestre (auditorías de gestión).
 */
export function commissionShortcuts(now = new Date()): ShortcutDescriptor[] {
  const cur = commissionPeriodRange(now);
  const prev = previousCommissionPeriodRange(now);
  const m = thisMonthRange(now);
  const lm = lastMonthRange(now);
  const lq = lastQuarterRange(now);
  return [
    { key: "commission-current", label: "Periodo de comisión", from: cur.from, to: cur.to, rangeLabel: cur.label },
    { key: "commission-prev", label: "Periodo anterior", from: prev.from, to: prev.to, rangeLabel: prev.label },
    { key: "this-month", label: "Mes natural", from: m.from, to: m.to, rangeLabel: m.label },
    { key: "last-month", label: "Mes pasado", from: lm.from, to: lm.to, rangeLabel: lm.label },
    { key: "last-quarter", label: "Último trimestre", from: lq.from, to: lq.to, rangeLabel: lq.label },
  ];
}

/** Devuelve true si el rango cubre exactamente un único mes natural completo. */
export function isFullNaturalMonth(range: DateRange): boolean {
  const a = range.from.split("-").map(Number);
  const b = range.to.split("-").map(Number);
  const y = a[0];
  const m = a[1];
  const d = a[2];
  const y2 = b[0];
  const m2 = b[1];
  const d2 = b[2];
  if (
    y === undefined ||
    m === undefined ||
    d === undefined ||
    y2 === undefined ||
    m2 === undefined ||
    d2 === undefined
  ) {
    return false;
  }
  if (y !== y2 || m !== m2 || d !== 1) return false;
  const lastDay = new Date(y, m, 0).getDate();
  return d2 === lastDay;
}

/**
 * Bucketea ISO timestamps por mes natural y devuelve un array alineado a
 * `monthsBack` posiciones, ordenado del más antiguo (índice 0) al actual
 * (índice `monthsBack - 1`). Los timestamps fuera de la ventana se ignoran.
 *
 * Lo usa el panel del comercial (`MonthBars` de su evolución) y el cálculo de
 * insignias (`computePanelBadges`, racha de meses). Función pura.
 */
export function bucketByMonth(
  timestamps: string[],
  monthsBack: number,
  now = new Date(),
): number[] {
  const buckets = new Array<number>(monthsBack).fill(0);
  // Bucketeo por mes de Madrid (no del runtime UTC) para casar con las fechas
  // que ve el comercial: una reseña de las 00:30 del 1 de mes en Madrid cae en
  // ese mes, no en el anterior.
  const base = madridCivil(now);
  for (const t of timestamps) {
    const c = madridCivil(new Date(t));
    const monthsAgo = (base.y - c.y) * 12 + (base.m - c.m);
    if (monthsAgo >= 0 && monthsAgo < monthsBack) {
      const idx = monthsBack - 1 - monthsAgo;
      buckets[idx] = (buckets[idx] ?? 0) + 1;
    }
  }
  return buckets;
}
