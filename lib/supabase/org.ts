import "server-only";
import type { createClient } from "./server";

/**
 * The exact return type of `lib/supabase/server.ts:createClient()`. Inferring
 * it here keeps us insulated from `@supabase/ssr` vs `@supabase/supabase-js`
 * type-param drift — they're not interchangeable across SDK versions.
 */
type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Defense-in-depth helper for the multi-tenant model.
 *
 * RLS (migration 012) already enforces that every authenticated query is
 * filtered by `org_id = current_org_id() OR is_super_admin()`. This module
 * adds a second layer at the application level: server actions read the
 * org_id of the caller and stamp it explicitly on INSERTs so the DB does
 * not have to guess.
 *
 * Golden rule: the org_id is ALWAYS derived server-side from the JWT
 * (via the cookie-authenticated Supabase client). NEVER accept it from the
 * client request body or query string.
 */

export type OrgContext = {
  /** Authenticated user id (from auth.uid()). */
  userId: string;
  /** Org the user belongs to. `null` only when the user is a super_admin. */
  orgId: string | null;
  /**
   * Slug of the user's org — required for building path-prefix URLs
   * (`/o/<orgSlug>/c/...`). `null` when the user has no org (super_admin
   * case) or, defensively, if the org was deleted underneath them.
   */
  orgSlug: string | null;
  /** True when the user has a row in super_admins. */
  isSuperAdmin: boolean;
};

/**
 * Resolves the org context for the request's authenticated user.
 *
 * Returns `null` when there is no session at all. Returns an `OrgContext`
 * with `orgId = null` for super_admins (they don't belong to any single
 * org). Throws nothing — let the caller decide whether the missing context
 * is a hard error.
 *
 * The `supabase` argument MUST be a cookie-authenticated server client
 * (from `lib/supabase/server.ts`); the service-role client bypasses RLS
 * and `auth.getUser()` returns nothing on it, so it would always yield
 * `null` here.
 */
export async function getCurrentOrgContext(
  supabase: ServerSupabaseClient,
): Promise<OrgContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, superRes] = await Promise.all([
    // The embedded select on organizations relies on the FK from profiles.org_id.
    // PostgREST/Supabase resolves it as a one-to-one join; the result is
    // `organizations: { slug } | null`.
    supabase
      .from("profiles")
      .select("org_id, organizations:organizations(slug)")
      .eq("id", user.id)
      .maybeSingle<{
        org_id: string | null;
        organizations: { slug: string } | null;
      }>(),
    supabase
      .from("super_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle<{ user_id: string }>(),
  ]);

  return {
    userId: user.id,
    orgId: profileRes.data?.org_id ?? null,
    orgSlug: profileRes.data?.organizations?.slug ?? null,
    isSuperAdmin: superRes.data !== null,
  };
}

/**
 * Like `getCurrentOrgContext` but throws when the org_id cannot be resolved.
 *
 * Use this in server actions whose payload writes to an org-scoped table.
 * The resulting object is narrowed so `orgId` is a non-null string — safe
 * to splat into an `.insert({ org_id, ... })` call.
 *
 * Super_admins don't belong to a specific org; if a super_admin calls a
 * regular server action without picking an org first, this throws. Those
 * flows must go through the service-role client with an explicit org_id.
 */
export async function requireOrgContext(
  supabase: ServerSupabaseClient,
): Promise<OrgContext & { orgId: string; orgSlug: string }> {
  const ctx = await getCurrentOrgContext(supabase);
  if (!ctx) {
    throw new Error("requireOrgContext: no authenticated user.");
  }
  if (!ctx.orgId) {
    if (ctx.isSuperAdmin) {
      throw new Error(
        "requireOrgContext: super_admin actions must run through the service-role " +
          "client with an explicit org_id, not the cookie-authenticated client.",
      );
    }
    throw new Error(
      "requireOrgContext: authenticated user has no org_id. " +
        "Either assign one or mark them as super_admin.",
    );
  }
  if (!ctx.orgSlug) {
    // The org_id resolved but the join with `organizations` returned no slug.
    // Either the org was deleted under us or PostgREST returned an unexpected
    // shape. Treat as a hard error so callers building path-prefix URLs
    // don't silently produce broken links.
    throw new Error(
      "requireOrgContext: user has org_id but no org slug could be resolved. " +
        "The organization may have been deleted.",
    );
  }
  return { ...ctx, orgId: ctx.orgId, orgSlug: ctx.orgSlug };
}
