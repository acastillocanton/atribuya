/**
 * Canonical plan tiers for the super-admin panel.
 *
 * `organizations.plan` is free-text in the DB (no migration / enum), so these
 * options only drive UI consistency. Orgs created before this list keep their
 * value and remain reassignable.
 *
 * Pricing v3 (2026-06-11): se vende por nº de comerciales (el valor del
 * producto crece con el equipo, no con las fichas) con un tope de fichas por
 * plan como segundo eje (las fichas son lo que cuesta dinero en API). Los
 * valores antiguos "starter"/"professional" (pricing v2, por fichas) quedan
 * como legacy: ilimitados en comerciales y con su tope de fichas original.
 */

export const PLAN_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "basic", label: "Básico (45 €, 5 comerciales + 1 ficha)" },
  { value: "standard", label: "Estándar (99 €, 15 comerciales + 3 fichas)" },
  { value: "plus", label: "Plus (199 €, 30 comerciales + 10 fichas)" },
  { value: "custom", label: "A medida" },
];

export const DEFAULT_PLAN = "basic";

/** Display label for a plan value, falling back to the raw value (e.g. legacy "starter"). */
export function planLabel(value: string): string {
  return PLAN_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

/**
 * Tope de fichas (locations) por plan. Fuente única de verdad del límite;
 * la impone `createLocation` a nivel de aplicación (no hay barrera en BD).
 *
 * `null` = ilimitado. Los planes desconocidos o legacy se tratan como
 * ilimitados a propósito: el enforcement es un freno comercial, no de
 * seguridad, y nunca debe bloquear a una org que ya existía antes de tener
 * un plan canónico asignado. Excepción: "starter"/"professional" (v2)
 * conservan su tope de fichas original.
 */
const PLAN_LOCATION_LIMITS: Record<string, number> = {
  basic: 1,
  standard: 3,
  plus: 10,
  // legacy v2 (por fichas) — mantienen su tope original
  starter: 2,
  professional: 10,
  // custom → sin entrada → ilimitado
};

/** Tope de fichas del plan, o `null` si es ilimitado / plan no reconocido. */
export function planLocationLimit(plan: string | null | undefined): number | null {
  if (!plan) return null;
  return PLAN_LOCATION_LIMITS[plan] ?? null;
}

/**
 * Tope de comerciales (seats) por plan. Cuentan los perfiles "productores"
 * (role sales u office_director: el director tiene panel propio y genera
 * reseñas igual que un comercial) con status invited o active. Pausar libera
 * el slot. Lo imponen las actions de alta/reactivación a nivel de app.
 *
 * Los planes legacy v2 ("starter"/"professional") vendían comerciales
 * ilimitados → sin entrada aquí.
 */
const PLAN_SALES_LIMITS: Record<string, number> = {
  basic: 5,
  standard: 15,
  plus: 30,
  // custom / legacy → sin entrada → ilimitado
};

/** Tope de comerciales del plan, o `null` si es ilimitado / plan no reconocido. */
export function planSalesLimit(plan: string | null | undefined): number | null {
  if (!plan) return null;
  return PLAN_SALES_LIMITS[plan] ?? null;
}
