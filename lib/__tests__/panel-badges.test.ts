import { describe, expect, it } from "vitest";
import {
  computePanelBadges,
  trailingStreak,
  type PanelBadgesInput,
} from "@/lib/panel-badges";

const base: PanelBadgesInput = {
  lifetimeCounted: 0,
  reviewsThisPeriod: 0,
  goal: 5,
  monthBuckets: [0, 0, 0, 0, 0, 0],
  fiveStarCount: 0,
  rankIndex: null,
  teamSize: 1,
};

function byId(badges: ReturnType<typeof computePanelBadges>, id: string) {
  return badges.find((b) => b.id === id);
}

describe("trailingStreak", () => {
  it("returns 0 when goal is 0 or negative", () => {
    expect(trailingStreak([10, 10, 10], 0)).toBe(0);
    expect(trailingStreak([10, 10, 10], -3)).toBe(0);
  });

  it("counts completed months meeting the goal, ignoring an in-progress current month", () => {
    // últimos buckets: [.., abr=6, may=7, jun(actual)=1] con goal 5
    // jun aún no llega → se ignora; abr y may sí → racha 2
    expect(trailingStreak([0, 0, 0, 6, 7, 1], 5)).toBe(2);
  });

  it("includes the current month when it already reached the goal", () => {
    expect(trailingStreak([0, 0, 0, 6, 7, 8], 5)).toBe(3);
  });

  it("breaks the streak on the first month below goal", () => {
    expect(trailingStreak([6, 2, 6, 6], 5)).toBe(2);
  });

  it("returns 0 for empty buckets", () => {
    expect(trailingStreak([], 5)).toBe(0);
  });
});

describe("computePanelBadges", () => {
  it("always includes objetivo and racha badges", () => {
    const badges = computePanelBadges(base);
    expect(byId(badges, "monthly_goal")).toBeDefined();
    expect(byId(badges, "streak")).toBeDefined();
  });

  it("marks the monthly goal as earned when reached", () => {
    const badges = computePanelBadges({ ...base, reviewsThisPeriod: 5, goal: 5 });
    expect(byId(badges, "monthly_goal")?.earned).toBe(true);
  });

  it("does not earn the monthly goal when goal is 0", () => {
    const badges = computePanelBadges({ ...base, reviewsThisPeriod: 3, goal: 0 });
    expect(byId(badges, "monthly_goal")?.earned).toBe(false);
  });

  it("omits team badges when there is no team", () => {
    const badges = computePanelBadges({ ...base, teamSize: 1, rankIndex: 0 });
    expect(byId(badges, "podium")).toBeUndefined();
    expect(byId(badges, "leader")).toBeUndefined();
  });

  it("includes team badges when there is a team", () => {
    const badges = computePanelBadges({ ...base, teamSize: 4, rankIndex: 2 });
    expect(byId(badges, "podium")?.earned).toBe(true); // puesto 3 → top 3
    expect(byId(badges, "leader")?.earned).toBe(false);
  });

  it("earns leader and podium for the #1", () => {
    const badges = computePanelBadges({ ...base, teamSize: 4, rankIndex: 0 });
    expect(byId(badges, "leader")?.earned).toBe(true);
    expect(byId(badges, "podium")?.earned).toBe(true);
  });

  it("does not earn podium below top 3", () => {
    const badges = computePanelBadges({ ...base, teamSize: 6, rankIndex: 3 });
    expect(byId(badges, "podium")?.earned).toBe(false);
  });

  it("earns the first-review badge from the first counted review", () => {
    expect(byId(computePanelBadges(base), "first_review")?.earned).toBe(false);
    expect(
      byId(computePanelBadges({ ...base, lifetimeCounted: 1 }), "first_review")?.earned,
    ).toBe(true);
  });

  it("shows the full volume ladder regardless of progress", () => {
    const badges = computePanelBadges({ ...base, lifetimeCounted: 30 });
    expect(byId(badges, "volume_10")?.earned).toBe(true);
    expect(byId(badges, "volume_25")?.earned).toBe(true);
    // La escalera es [10, 25]; no hay tiers superiores en volumen.
    const volumeIds = badges.filter((b) => b.id.startsWith("volume_")).map((b) => b.id);
    expect(volumeIds).toEqual(["volume_10", "volume_25"]);
  });

  it("shows every volume tier as locked when starting out", () => {
    const badges = computePanelBadges({ ...base, lifetimeCounted: 0 });
    expect(byId(badges, "volume_10")?.earned).toBe(false);
    expect(byId(badges, "volume_25")?.earned).toBe(false);
  });

  it("shows the full five-star ladder including 50", () => {
    const badges = computePanelBadges({ ...base, fiveStarCount: 12 });
    expect(byId(badges, "five_star_10")?.earned).toBe(true);
    expect(byId(badges, "five_star_25")?.earned).toBe(false);
    expect(byId(badges, "five_star_50")?.earned).toBe(false);
  });

  it("renders 10 badges with a team and 8 without", () => {
    expect(computePanelBadges({ ...base, teamSize: 5, rankIndex: 1 })).toHaveLength(10);
    expect(computePanelBadges({ ...base, teamSize: 1 })).toHaveLength(8);
  });
});
