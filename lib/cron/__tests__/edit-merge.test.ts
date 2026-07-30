import { describe, expect, it } from "vitest";
import { decideEditMerge, type IncumbentLite } from "@/lib/cron/edit-merge";

const inc = (over: Partial<IncumbentLite> = {}): IncumbentLite => ({
  id: "inc-1",
  rating: 5,
  removed_at: null,
  low_rating_alerted_at: null,
  ...over,
});

describe("decideEditMerge", () => {
  it("autor anónimo → insert (no se puede identificar a la persona)", () => {
    const r = decideEditMerge({
      hasAuthorName: false,
      incumbents: [inc()],
      incomingRating: 5,
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("0 incumbentes → insert (reseña genuinamente nueva)", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [],
      incomingRating: 5,
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("≥2 incumbentes → insert (ambigüedad legacy, no adivinar)", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "a" }), inc({ id: "b" })],
      incomingRating: 5,
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("1 incumbente 5★→5★ (Marina) → merge sin re-alert ni clearRemoved", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "m", rating: 5 })],
      incomingRating: 5,
    });
    expect(r).toEqual({
      action: "merge",
      incumbentId: "m",
      clearRemovedAt: false,
      reAlertLowRating: false,
    });
  });

  it("1 incumbente 5★→1★ (baja a low por primera vez) → merge con re-alert", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "x", rating: 5, low_rating_alerted_at: null })],
      incomingRating: 1,
    });
    expect(r).toEqual({
      action: "merge",
      incumbentId: "x",
      clearRemovedAt: false,
      reAlertLowRating: true,
    });
  });

  it("1 incumbente 1★→5★ (Nuria) → merge sin re-alert", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "n", rating: 1 })],
      incomingRating: 5,
    });
    expect(r).toEqual({
      action: "merge",
      incumbentId: "n",
      clearRemovedAt: false,
      reAlertLowRating: false,
    });
  });

  it("1 incumbente 2★→1★ (ya era low) → merge sin re-alert (anti-spam)", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "y", rating: 2 })],
      incomingRating: 1,
    });
    expect(r).toEqual({
      action: "merge",
      incumbentId: "y",
      clearRemovedAt: false,
      reAlertLowRating: false,
    });
  });

  it("1 incumbente soft-deleted → merge con clearRemovedAt=true (revive)", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [inc({ id: "z", removed_at: "2026-06-01T00:00:00Z" })],
      incomingRating: 5,
    });
    expect(r).toEqual({
      action: "merge",
      incumbentId: "z",
      clearRemovedAt: true,
      reAlertLowRating: false,
    });
  });

  it("1 incumbente ya alertado, edición sigue low → no re-alert", () => {
    const r = decideEditMerge({
      hasAuthorName: true,
      incumbents: [
        inc({ id: "w", rating: 5, low_rating_alerted_at: "2026-06-01T00:00:00Z" }),
      ],
      incomingRating: 1,
    });
    // rating del incumbente NO era low, pero ya había alerta previa → no repetir.
    expect(r).toEqual({
      action: "merge",
      incumbentId: "w",
      clearRemovedAt: false,
      reAlertLowRating: false,
    });
  });
});

// ─── decideCrossSourceClaim (transición Vía A → Vía B) ───────────────────────

import {
  decideCrossSourceClaim,
  ANON_CLAIM_TOLERANCE_MS,
  type PlacesIncumbent,
} from "@/lib/cron/edit-merge";

const T0 = "2026-05-24T10:00:00.000Z";
const t0Plus = (ms: number) => new Date(new Date(T0).getTime() + ms).toISOString();

const pInc = (over: Partial<PlacesIncumbent> = {}): PlacesIncumbent => ({
  id: "p-1",
  author_name: "Lucía Moragón",
  hasAuthorName: true,
  rating: 5,
  google_created_at: T0,
  removed_at: null,
  low_rating_alerted_at: null,
  ...over,
});

describe("decideCrossSourceClaim", () => {
  it("autor con nombre + 1 incumbente del mismo autor → claim", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [pInc()],
    });
    expect(r).toEqual({
      action: "claim",
      incumbentId: "p-1",
      clearRemovedAt: false,
      reAlertLowRating: false,
    });
  });

  it("autor con nombre: claim aunque rating y fecha difieran (edición entre syncs)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 1,
      incomingCreatedAt: t0Plus(72 * 3_600_000),
      incumbents: [pInc({ rating: 5 })],
    });
    expect(r.action).toBe("claim");
    if (r.action === "claim") expect(r.reAlertLowRating).toBe(true);
  });

  it("autor con nombre: NO reclama incumbentes de otro autor", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Otra Persona",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [pInc()],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("autor con nombre + 2 incumbentes del mismo autor → insert (ambigüedad)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [pInc(), pInc({ id: "p-2" })],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("anónima: claim con mismo rating y timestamp dentro de tolerancia", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 4,
      incomingCreatedAt: t0Plus(ANON_CLAIM_TOLERANCE_MS - 1000),
      incumbents: [
        pInc({ author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
      ],
    });
    expect(r.action).toBe("claim");
  });

  it("anónima: empareja también contra updateTime (reseña editada)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 4,
      incomingCreatedAt: "2020-01-01T00:00:00.000Z",
      incomingUpdatedAt: T0,
      incumbents: [
        pInc({ author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
      ],
    });
    expect(r.action).toBe("claim");
  });

  it("anónima: fuera de tolerancia → insert", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 4,
      incomingCreatedAt: t0Plus(ANON_CLAIM_TOLERANCE_MS + 60_000),
      incumbents: [
        pInc({ author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
      ],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("anónima: rating distinto → insert aunque el timestamp coincida", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [
        pInc({ author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
      ],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("anónima: 2 candidatas equivalentes → insert (ambigüedad)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 4,
      incomingCreatedAt: T0,
      incumbents: [
        pInc({ author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
        pInc({ id: "p-2", author_name: "Anónimo", hasAuthorName: false, rating: 4 }),
      ],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("anónima NO reclama incumbentes con nombre (y viceversa)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: false,
      authorName: "Anónimo",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [pInc({ rating: 5 })],
    });
    expect(r).toEqual({ action: "insert" });
  });

  it("incumbente soft-borrada → claim con clearRemovedAt (la Vía B la revive)", () => {
    const r = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 5,
      incomingCreatedAt: T0,
      incumbents: [pInc({ removed_at: "2026-06-01T00:00:00Z" })],
    });
    expect(r).toEqual({
      action: "claim",
      incumbentId: "p-1",
      clearRemovedAt: true,
      reAlertLowRating: false,
    });
  });

  it("no re-alerta si la incumbente ya era ≤2★ o ya se alertó", () => {
    const yaBaja = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 1,
      incomingCreatedAt: T0,
      incumbents: [pInc({ rating: 2 })],
    });
    expect(yaBaja.action).toBe("claim");
    if (yaBaja.action === "claim") expect(yaBaja.reAlertLowRating).toBe(false);

    const yaAlertada = decideCrossSourceClaim({
      hasAuthorName: true,
      authorName: "Lucía Moragón",
      incomingRating: 1,
      incomingCreatedAt: T0,
      incumbents: [pInc({ rating: 5, low_rating_alerted_at: "2026-06-01T00:00:00Z" })],
    });
    expect(yaAlertada.action).toBe("claim");
    if (yaAlertada.action === "claim") expect(yaAlertada.reAlertLowRating).toBe(false);
  });
});
