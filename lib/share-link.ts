/**
 * Single source of truth for building the public landing URLs.
 *
 * Since Phase 6 + migration 013, the path is `/o/<orgSlug>/c/<salesSlug>`
 * optionally suffixed with `/<clientSlug>`. The `salesSlug` is no longer
 * unique globally — it's unique per org — so the orgSlug is REQUIRED to
 * resolve the link correctly.
 */

export function buildSharePath(
  orgSlug: string,
  salesSlug: string,
  clientSlug?: string,
): string {
  const base = `/o/${orgSlug}/c/${salesSlug}`;
  return clientSlug ? `${base}/${clientSlug}` : base;
}

export function buildShareUrl(
  appBase: string,
  orgSlug: string,
  salesSlug: string,
  clientSlug?: string,
): string {
  const cleanBase = appBase.replace(/\/$/, "");
  return `${cleanBase}${buildSharePath(orgSlug, salesSlug, clientSlug)}`;
}

/**
 * Just the host + path without the URL scheme, for compact display (e.g. in
 * QR captions or share blocks): `app.atribuya.com/o/acme/c/juan`.
 */
export function buildShareDisplay(
  appBase: string,
  orgSlug: string,
  salesSlug: string,
  clientSlug?: string,
): string {
  return buildShareUrl(appBase, orgSlug, salesSlug, clientSlug).replace(
    /^https?:\/\//,
    "",
  );
}
