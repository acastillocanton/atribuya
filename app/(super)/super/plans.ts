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
