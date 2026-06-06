import { describe, it, expect } from "vitest";
import { getCurrentOrgContext, requireOrgContext } from "../org";

/**
 * Lightweight mock of `lib/supabase/server.ts:createClient()` return value.
 * Only exposes the surface that `org.ts` touches: `auth.getUser()`,
 * `.from(table).select().eq().maybeSingle()`. Cast to the public type once
 * built — the real client has many more methods we don't need here.
 */
function createMockClient(opts: {
  user: { id: string } | null;
  profile: {
    org_id: string | null;
    organizations?: { slug: string } | null;
  } | null;
  superAdmin: { user_id: string } | null;
}) {
  const tableHandlers: Record<string, () => Promise<{ data: unknown; error: null }>> = {
    profiles: async () => ({ data: opts.profile, error: null }),
    super_admins: async () => ({ data: opts.superAdmin, error: null }),
  };
  return {
    auth: {
      getUser: async () => ({ data: { user: opts.user }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: tableHandlers[table] ?? (() => Promise.resolve({ data: null, error: null })),
        }),
      }),
    }),
  } as unknown as Parameters<typeof getCurrentOrgContext>[0];
}

const FAKE_USER_ID = "00000000-0000-0000-0000-000000000001";
const FAKE_ORG_ID = "11111111-1111-1111-1111-111111111111";
const FAKE_ORG_SLUG = "acme-promotora";

describe("getCurrentOrgContext", () => {
  it("returns null when there is no authenticated user", async () => {
    const supa = createMockClient({ user: null, profile: null, superAdmin: null });
    const ctx = await getCurrentOrgContext(supa);
    expect(ctx).toBeNull();
  });

  it("returns orgId and orgSlug for a normal org member", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: FAKE_ORG_ID, organizations: { slug: FAKE_ORG_SLUG } },
      superAdmin: null,
    });
    const ctx = await getCurrentOrgContext(supa);
    expect(ctx).toEqual({
      userId: FAKE_USER_ID,
      orgId: FAKE_ORG_ID,
      orgSlug: FAKE_ORG_SLUG,
      isSuperAdmin: false,
    });
  });

  it("returns orgSlug=null and isSuperAdmin=true for a super_admin without org", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: null, organizations: null },
      superAdmin: { user_id: FAKE_USER_ID },
    });
    const ctx = await getCurrentOrgContext(supa);
    expect(ctx).toEqual({
      userId: FAKE_USER_ID,
      orgId: null,
      orgSlug: null,
      isSuperAdmin: true,
    });
  });

  it("returns orgSlug=null and isSuperAdmin=false for an authenticated user without profile", async () => {
    // This is the 'invited, not yet onboarded' edge case — middleware bounces
    // them to /accept-invite, but the helper should still return shape.
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: null,
      superAdmin: null,
    });
    const ctx = await getCurrentOrgContext(supa);
    expect(ctx).toEqual({
      userId: FAKE_USER_ID,
      orgId: null,
      orgSlug: null,
      isSuperAdmin: false,
    });
  });
});

describe("requireOrgContext", () => {
  it("throws when there is no authenticated user", async () => {
    const supa = createMockClient({ user: null, profile: null, superAdmin: null });
    await expect(requireOrgContext(supa)).rejects.toThrow(/no authenticated user/i);
  });

  it("returns the ctx with non-null orgId+orgSlug for a normal org member", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: FAKE_ORG_ID, organizations: { slug: FAKE_ORG_SLUG } },
      superAdmin: null,
    });
    const ctx = await requireOrgContext(supa);
    expect(ctx.orgId).toBe(FAKE_ORG_ID);
    expect(ctx.orgSlug).toBe(FAKE_ORG_SLUG);
    expect(ctx.userId).toBe(FAKE_USER_ID);
    expect(ctx.isSuperAdmin).toBe(false);
  });

  it("throws a super_admin-specific error when a super_admin without org calls it", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: null, organizations: null },
      superAdmin: { user_id: FAKE_USER_ID },
    });
    await expect(requireOrgContext(supa)).rejects.toThrow(/super_admin/i);
  });

  it("throws when an authenticated user has no org and is not super_admin", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: null, organizations: null },
      superAdmin: null,
    });
    await expect(requireOrgContext(supa)).rejects.toThrow(/no org_id/i);
  });

  it("throws when org_id is present but org slug couldn't be resolved (org deleted underneath user)", async () => {
    const supa = createMockClient({
      user: { id: FAKE_USER_ID },
      profile: { org_id: FAKE_ORG_ID, organizations: null },
      superAdmin: null,
    });
    await expect(requireOrgContext(supa)).rejects.toThrow(/no org slug/i);
  });
});
