import { describe, it, expect } from "vitest";
import { processFreshReviews, type FreshReview, type LocationSummary } from "../process-reviews";

/**
 * Asserts the Phase 4 invariant: the `org_id` of the location is forwarded
 * to every `reviews` INSERT, so RLS multi-tenant policies (migration 012)
 * see the row belonging to the right tenant.
 *
 * We mock the supabase admin client capturing INSERT payloads. The `share_links`
 * candidate query returns an empty array, so all reviews end up `unmatched` —
 * we don't care about matching here, only about org_id propagation.
 */
type InsertedRow = Record<string, unknown>;

function makeMockAdmin(captured: InsertedRow[]) {
  return {
    from(_table: string) {
      return {
        select(_cols: string) {
          const chain = {
            eq() {
              return this;
            },
            in() {
              return this;
            },
            gte() {
              return this;
            },
            order() {
              return this;
            },
            limit() {
              return this;
            },
            returns() {
              // candidates query → no share_links in the window
              return Promise.resolve({ data: [], error: null });
            },
          };
          return chain;
        },
        insert(row: InsertedRow) {
          captured.push(row);
          return {
            select() {
              return {
                single() {
                  // returning shape used by processFreshReviews → { id }
                  return Promise.resolve({ data: { id: `inserted-${captured.length}` }, error: null });
                },
              };
            },
          };
        },
      };
    },
  };
}

function makeFreshReview(googleReviewId: string): FreshReview {
  return {
    google_review_id: googleReviewId,
    author_name: "Cliente Test",
    hasAuthorName: true,
    rating: 5,
    text: "Excelente",
    google_created_at: new Date("2026-05-24T10:00:00Z").toISOString(),
  };
}

function newSummary(locationId: string): LocationSummary {
  return {
    location_id: locationId,
    location_name: "Test Loc",
    fetched: 1,
    new_reviews: 0,
    counted: 0,
    pending: 0,
    unmatched: 0,
  };
}

describe("processFreshReviews: org_id propagation (Phase 4)", () => {
  it("stamps the location's org_id on the inserted reviews row", async () => {
    const captured: InsertedRow[] = [];
    const ORG_A = "11111111-1111-1111-1111-111111111111";
    const summary = newSummary("loc-A1");

    await processFreshReviews(
      {
        admin: makeMockAdmin(captured) as never,
        location: { id: "loc-A1", name: "Acme Centro", org_id: ORG_A },
        fresh: [makeFreshReview("places:rev-1")],
        salesById: new Map(),
        source: "places_api",
      },
      summary,
    );

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      location_id: "loc-A1",
      org_id: ORG_A,
      google_review_id: "places:rev-1",
    });
  });

  it("uses the correct org_id when called for two different orgs in the same process", async () => {
    const captured: InsertedRow[] = [];
    const ORG_A = "11111111-1111-1111-1111-111111111111";
    const ORG_B = "22222222-2222-2222-2222-222222222222";

    await processFreshReviews(
      {
        admin: makeMockAdmin(captured) as never,
        location: { id: "loc-A1", name: "Acme", org_id: ORG_A },
        fresh: [makeFreshReview("places:rev-A")],
        salesById: new Map(),
        source: "places_api",
      },
      newSummary("loc-A1"),
    );
    await processFreshReviews(
      {
        admin: makeMockAdmin(captured) as never,
        location: { id: "loc-B1", name: "Beta", org_id: ORG_B },
        fresh: [makeFreshReview("places:rev-B")],
        salesById: new Map(),
        source: "places_api",
      },
      newSummary("loc-B1"),
    );

    expect(captured).toHaveLength(2);
    const [rowA, rowB] = captured;
    expect(rowA).toMatchObject({ org_id: ORG_A, google_review_id: "places:rev-A" });
    expect(rowB).toMatchObject({ org_id: ORG_B, google_review_id: "places:rev-B" });
    // Critical: no row carries the wrong org_id
    expect(rowA?.org_id).not.toBe(ORG_B);
    expect(rowB?.org_id).not.toBe(ORG_A);
  });
});
