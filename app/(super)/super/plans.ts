/**
 * Canonical plan tiers for the super-admin panel.
 *
 * `organizations.plan` is free-text in the DB (no migration / enum), so these
 * options only drive UI consistency. Orgs created before this list (e.g. the
 * legacy "standard" value) keep their value and remain reassignable.
 */

export const PLAN_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "starter", label: "Starter (45 €, hasta 2 fichas)" },
  { value: "professional", label: "Professional (149 €, hasta 10)" },
  { value: "custom", label: "A medida" },
];

export const DEFAULT_PLAN = "starter";

/** Display label for a plan value, falling back to the raw value (e.g. legacy "standard"). */
export function planLabel(value: string): string {
  return PLAN_OPTIONS.find((p) => p.value === value)?.label ?? value;
}

/**
 * Tope de fichas (locations) por plan. Fuente única de verdad del límite;
 * la impone `createLocation` a nivel de aplicación (no hay barrera en BD).
 *
 * `null` = ilimitado. Los planes desconocidos o legacy (p. ej. "standard",
 * el default original) se tratan como ilimitados a propósito: el enforcement
 * es un freno comercial, no de seguridad, y nunca debe bloquear a una org
 * que ya existía antes de tener un plan canónico asignado.
 */
const PLAN_LOCATION_LIMITS: Record<string, number> = {
  starter: 2,
  professional: 10,
  // custom → sin entrada → ilimitado
};

/** Tope de fichas del plan, o `null` si es ilimitado / plan no reconocido. */
export function planLocationLimit(plan: string | null | undefined): number | null {
  if (!plan) return null;
  return PLAN_LOCATION_LIMITS[plan] ?? null;
}
