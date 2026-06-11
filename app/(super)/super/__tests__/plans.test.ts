import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLAN,
  PLAN_OPTIONS,
  planLabel,
  planLocationLimit,
  planSalesLimit,
} from "../plans";

/**
 * Los topes de fichas y comerciales por plan son el freno comercial del
 * pricing v3 (no hay barrera en BD), así que la tabla de límites se fija
 * por test: un cambio accidental aquí cambia lo que vendemos.
 */

describe("planLocationLimit", () => {
  it("aplica el tope de fichas de los tiers v3", () => {
    expect(planLocationLimit("basic")).toBe(1);
    expect(planLocationLimit("standard")).toBe(3);
    expect(planLocationLimit("plus")).toBe(10);
  });

  it("mantiene el tope de fichas de los planes legacy v2", () => {
    expect(planLocationLimit("starter")).toBe(2);
    expect(planLocationLimit("professional")).toBe(10);
  });

  it("trata custom, desconocidos y vacíos como ilimitado", () => {
    expect(planLocationLimit("custom")).toBeNull();
    expect(planLocationLimit("plan-inventado")).toBeNull();
    expect(planLocationLimit(null)).toBeNull();
    expect(planLocationLimit(undefined)).toBeNull();
    expect(planLocationLimit("")).toBeNull();
  });
});

describe("planSalesLimit", () => {
  it("aplica el tope de comerciales de los tiers v3", () => {
    expect(planSalesLimit("basic")).toBe(5);
    expect(planSalesLimit("standard")).toBe(15);
    expect(planSalesLimit("plus")).toBe(30);
  });

  it("deja ilimitados los planes legacy v2 (vendían comerciales ilimitados)", () => {
    expect(planSalesLimit("starter")).toBeNull();
    expect(planSalesLimit("professional")).toBeNull();
  });

  it("trata custom, desconocidos y vacíos como ilimitado", () => {
    expect(planSalesLimit("custom")).toBeNull();
    expect(planSalesLimit("plan-inventado")).toBeNull();
    expect(planSalesLimit(null)).toBeNull();
    expect(planSalesLimit(undefined)).toBeNull();
    expect(planSalesLimit("")).toBeNull();
  });
});

describe("PLAN_OPTIONS", () => {
  it("ofrece los 4 tiers v3 y el default es basic", () => {
    expect(PLAN_OPTIONS.map((p) => p.value)).toEqual([
      "basic",
      "standard",
      "plus",
      "custom",
    ]);
    expect(DEFAULT_PLAN).toBe("basic");
  });

  it("planLabel cae al valor crudo para planes fuera de la lista", () => {
    expect(planLabel("basic")).toContain("Básico");
    expect(planLabel("starter")).toBe("starter");
  });
});
