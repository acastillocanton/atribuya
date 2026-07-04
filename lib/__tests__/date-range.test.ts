import { describe, it, expect } from "vitest";
import {
  parseRange,
  thisMonthRange,
  lastMonthRange,
  lastQuarterRange,
  isFullNaturalMonth,
  commissionPeriodRange,
  previousCommissionPeriodRange,
  isCommissionPeriod,
} from "../date-range";

// Fecha de referencia fija para reproducibilidad: 15 mayo 2026 (mié).
const NOW = new Date(Date.UTC(2026, 4, 15, 12)); // mes index 4 = mayo

describe("thisMonthRange", () => {
  it("rango = 1..último día del mes actual", () => {
    const r = thisMonthRange(NOW);
    expect(r.from).toBe("2026-05-01");
    expect(r.to).toBe("2026-05-31");
    expect(r.label).toBe("mayo 2026");
  });
});

describe("lastMonthRange", () => {
  it("rango = mes anterior completo", () => {
    const r = lastMonthRange(NOW);
    expect(r.from).toBe("2026-04-01");
    expect(r.to).toBe("2026-04-30");
    expect(r.label).toBe("abril 2026");
  });

  it("salto de año diciembre → enero", () => {
    const enero = new Date(Date.UTC(2026, 0, 10, 12)); // 10 ene 2026
    const r = lastMonthRange(enero);
    expect(r.from).toBe("2025-12-01");
    expect(r.to).toBe("2025-12-31");
  });
});

describe("lastQuarterRange", () => {
  it("desde 3 meses atrás hasta cierre del mes anterior", () => {
    const r = lastQuarterRange(NOW);
    expect(r.from).toBe("2026-02-01");
    expect(r.to).toBe("2026-04-30");
  });
});

describe("parseRange", () => {
  it("from/to válidos → buildRange con esos valores", () => {
    const r = parseRange("2026-03-01", "2026-03-31", NOW);
    expect(r.from).toBe("2026-03-01");
    expect(r.to).toBe("2026-03-31");
    expect(r.label).toBe("marzo 2026");
  });

  it("from o to vacío → cae a mes actual", () => {
    expect(parseRange(undefined, "2026-03-31", NOW).from).toBe("2026-05-01");
    expect(parseRange("2026-03-01", undefined, NOW).from).toBe("2026-05-01");
    expect(parseRange(null, null, NOW).from).toBe("2026-05-01");
  });

  it("formato inválido → cae a mes actual", () => {
    expect(parseRange("invalid", "2026-03-31", NOW).from).toBe("2026-05-01");
    expect(parseRange("2026-13-01", "2026-03-31", NOW).from).toBe("2026-05-01");
    expect(parseRange("2026-02-30", "2026-03-31", NOW).from).toBe("2026-05-01");
  });

  it("from > to (invertido) → cae a mes actual (no invierte silenciosamente)", () => {
    const r = parseRange("2026-05-31", "2026-05-01", NOW);
    // Antes invertía silencioso; ahora caemos al mes actual.
    expect(r.from).toBe("2026-05-01");
    expect(r.to).toBe("2026-05-31");
  });

  it("rango con un solo día válido", () => {
    const r = parseRange("2026-03-15", "2026-03-15", NOW);
    expect(r.from).toBe("2026-03-15");
    expect(r.to).toBe("2026-03-15");
  });

  it("rango cross-month produce label compacto", () => {
    const r = parseRange("2026-03-15", "2026-04-15", NOW);
    expect(r.label).toContain("mar");
    expect(r.label).toContain("abr");
    expect(r.label).toContain("–");
  });
});

describe("isFullNaturalMonth", () => {
  it("rango 1..ult-día → true", () => {
    expect(isFullNaturalMonth(thisMonthRange(NOW))).toBe(true);
    expect(isFullNaturalMonth(lastMonthRange(NOW))).toBe(true);
  });

  it("rango con día central → false", () => {
    expect(isFullNaturalMonth(parseRange("2026-05-02", "2026-05-31", NOW))).toBe(
      false,
    );
    expect(isFullNaturalMonth(parseRange("2026-05-01", "2026-05-30", NOW))).toBe(
      false,
    );
  });

  it("rango cross-month → false", () => {
    expect(isFullNaturalMonth(parseRange("2026-05-01", "2026-06-30", NOW))).toBe(
      false,
    );
  });

  it("rango trimestral (3 meses) → false", () => {
    expect(isFullNaturalMonth(lastQuarterRange(NOW))).toBe(false);
  });
});

describe("commissionPeriodRange (20 → 19)", () => {
  it("día 15 (antes del 20) → periodo del 20 del mes anterior al 19 del actual", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 4, 15, 12))); // 15 may
    expect(r.from).toBe("2026-04-20");
    expect(r.to).toBe("2026-05-19");
  });

  it("día 19 sigue en el periodo que cierra ese día", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 4, 19, 12))); // 19 may
    expect(r.from).toBe("2026-04-20");
    expect(r.to).toBe("2026-05-19");
  });

  it("día 20 abre periodo nuevo (20 actual → 19 siguiente)", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 4, 20, 12))); // 20 may
    expect(r.from).toBe("2026-05-20");
    expect(r.to).toBe("2026-06-19");
  });

  it("día 21 está en el periodo abierto el 20", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 4, 21, 12))); // 21 may
    expect(r.from).toBe("2026-05-20");
    expect(r.to).toBe("2026-06-19");
  });

  it("cruce de año: 25 dic → 20 dic a 19 ene del año siguiente", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 11, 25, 12))); // 25 dic 2026
    expect(r.from).toBe("2026-12-20");
    expect(r.to).toBe("2027-01-19");
  });

  it("cruce de año hacia atrás: 10 ene → 20 dic del año anterior a 19 ene", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 0, 10, 12))); // 10 ene 2026
    expect(r.from).toBe("2025-12-20");
    expect(r.to).toBe("2026-01-19");
  });

  it("label compacto con guion", () => {
    const r = commissionPeriodRange(new Date(Date.UTC(2026, 4, 15, 12)));
    expect(r.label).toContain("abr");
    expect(r.label).toContain("may");
    expect(r.label).toContain("–");
  });
});

describe("previousCommissionPeriodRange", () => {
  it("periodo inmediatamente anterior al vigente", () => {
    const r = previousCommissionPeriodRange(new Date(Date.UTC(2026, 4, 25, 12))); // vigente 20 may–19 jun
    expect(r.from).toBe("2026-04-20");
    expect(r.to).toBe("2026-05-19");
  });

  it("es contiguo y sin solape con el vigente", () => {
    const now = new Date(Date.UTC(2026, 4, 25, 12));
    const cur = commissionPeriodRange(now);
    const prev = previousCommissionPeriodRange(now);
    expect(prev.to).toBe("2026-05-19");
    expect(cur.from).toBe("2026-05-20");
  });
});

describe("isCommissionPeriod", () => {
  it("true para el rango devuelto por commissionPeriodRange(now)", () => {
    const now = new Date(Date.UTC(2026, 4, 15, 12));
    expect(isCommissionPeriod(commissionPeriodRange(now), now)).toBe(true);
  });

  it("false para un mes natural", () => {
    const now = new Date(Date.UTC(2026, 4, 15, 12));
    expect(isCommissionPeriod(thisMonthRange(now), now)).toBe(false);
  });
});

describe("parseRange con fallback de comisión", () => {
  it("sin params usa el fallback indicado (periodo de comisión)", () => {
    const now = new Date(Date.UTC(2026, 4, 15, 12));
    const r = parseRange(undefined, undefined, now, commissionPeriodRange);
    expect(r.from).toBe("2026-04-20");
    expect(r.to).toBe("2026-05-19");
  });

  it("from>to inválido cae al fallback de comisión", () => {
    const now = new Date(Date.UTC(2026, 4, 15, 12));
    const r = parseRange("2026-05-31", "2026-05-01", now, commissionPeriodRange);
    expect(r.from).toBe("2026-04-20");
  });
});

describe("límites en hora de Madrid (#9 TZ)", () => {
  it("startIso/endIso de mayo (CEST, UTC+2) son medianoche de Madrid, no UTC", () => {
    const r = thisMonthRange(new Date(Date.UTC(2026, 4, 15, 12)));
    // 1 may 00:00 Madrid = 30 abr 22:00 UTC; 1 jun 00:00 Madrid = 31 may 22:00 UTC.
    expect(r.startIso).toBe("2026-04-30T22:00:00.000Z");
    expect(r.endIso).toBe("2026-05-31T22:00:00.000Z");
  });

  it("startIso de enero (CET, UTC+1) es medianoche de Madrid", () => {
    const r = thisMonthRange(new Date(Date.UTC(2026, 0, 15, 12)));
    // 1 ene 00:00 Madrid = 31 dic 23:00 UTC.
    expect(r.startIso).toBe("2025-12-31T23:00:00.000Z");
  });

  it("reseña de las 00:30 de Madrid del día 20 cae en el periodo que abre el 20", () => {
    // 00:30 Madrid del 20 may (CEST) = 22:30 UTC del 19 may. Con límites UTC
    // habría caído en el periodo anterior (bug). Con límites de Madrid, dentro.
    const reviewInstant = "2026-05-19T22:30:00.000Z";
    const period = commissionPeriodRange(new Date(Date.UTC(2026, 4, 25, 12)));
    expect(period.from).toBe("2026-05-20");
    expect(period.startIso <= reviewInstant).toBe(true);
    expect(reviewInstant < period.endIso).toBe(true);
  });
});
