import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Stubs para next/headers y el cliente service-role de Supabase.
 *
 * El factory de vi.mock se evalúa antes del import del módulo testeado, así
 * que las `vi.fn()` viven en el closure y las exponemos a través de
 * helpers que cada test resetea con `beforeEach`.
 */

const headerStore: Record<string, string | null> = {
  "user-agent": "Mozilla/5.0 (test)",
  "x-forwarded-for": "203.0.113.42, 10.0.0.1",
  "x-real-ip": null,
};

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headerStore[name.toLowerCase()] ?? null,
  }),
}));

type CapturedInsert = Record<string, unknown>;
const captured: { rows: CapturedInsert[] } = { rows: [] };
let insertError: { message: string } | null = null;

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from(_table: string) {
      return {
        async insert(row: CapturedInsert) {
          captured.rows.push(row);
          return { error: insertError };
        },
      };
    },
  }),
}));

import { submitLead } from "../submit-lead";

function buildForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("submitLead", () => {
  beforeEach(() => {
    captured.rows = [];
    insertError = null;
  });

  it("acepta un payload válido, normaliza e inserta", async () => {
    const fd = buildForm({
      name: "  Ana Pérez  ",
      email: "  ANA@Empresa.COM ",
      company: "  Promotora Ejemplo SL  ",
      message: "  Hola, somos 6 comerciales en Castellón.  ",
    });
    const res = await submitLead(fd);
    expect(res).toEqual({ ok: true });
    expect(captured.rows).toHaveLength(1);
    expect(captured.rows[0]).toMatchObject({
      name: "Ana Pérez",
      email: "ana@empresa.com",
      company: "Promotora Ejemplo SL",
      message: "Hola, somos 6 comerciales en Castellón.",
      source: "landing",
      user_agent: "Mozilla/5.0 (test)",
      // x-forwarded-for trae cadena de IPs; debemos tomar la PRIMERA.
      ip: "203.0.113.42",
    });
  });

  it("acepta payload sin mensaje y persiste message como null", async () => {
    const fd = buildForm({
      name: "Juan Pérez",
      email: "juan@empresa.com",
      company: "Acme SL",
      message: "   ",
    });
    const res = await submitLead(fd);
    expect(res).toEqual({ ok: true });
    expect(captured.rows[0]?.message).toBeNull();
  });

  it("honeypot: si 'website' viene rellenado, NO inserta pero devuelve ok", async () => {
    const fd = buildForm({
      name: "Bot Spammer",
      email: "spam@bots.com",
      company: "Bot SL",
      website: "https://bot-site-please-add-me.example",
    });
    const res = await submitLead(fd);
    expect(res).toEqual({ ok: true });
    expect(captured.rows).toHaveLength(0);
  });

  it("rechaza email inválido con fieldErrors.email", async () => {
    const fd = buildForm({
      name: "Ana",
      email: "no-es-email",
      company: "Acme",
    });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors?.email).toBeTruthy();
    }
    expect(captured.rows).toHaveLength(0);
  });

  it("rechaza nombre demasiado corto", async () => {
    const fd = buildForm({ name: "A", email: "a@b.com", company: "Acme" });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors?.name).toBeTruthy();
    }
    expect(captured.rows).toHaveLength(0);
  });

  it("rechaza empresa demasiado corta", async () => {
    const fd = buildForm({ name: "Ana", email: "a@b.com", company: "X" });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors?.company).toBeTruthy();
    }
  });

  it("rechaza mensaje > 2000 chars", async () => {
    const fd = buildForm({
      name: "Ana",
      email: "a@b.com",
      company: "Acme",
      message: "x".repeat(2001),
    });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors?.message).toBeTruthy();
    }
  });

  it("si el INSERT a Supabase falla, devuelve mensaje genérico (no filtra detalles)", async () => {
    insertError = { message: "duplicate key value violates unique constraint" };
    const fd = buildForm({
      name: "Ana",
      email: "a@b.com",
      company: "Acme SL",
    });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).not.toContain("duplicate");
      expect(res.error).toMatch(/no se pudo enviar/i);
    }
  });

  it("locale=en: errores de validación se devuelven en inglés", async () => {
    const fd = buildForm({
      name: "A", // demasiado corto
      email: "no-es-email",
      company: "X", // demasiado corto
      locale: "en",
    });
    const res = await submitLead(fd);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/please review/i);
      expect(res.fieldErrors?.name).toMatch(/too short/i);
      expect(res.fieldErrors?.email).toMatch(/invalid/i);
      expect(res.fieldErrors?.company).toMatch(/too short/i);
    }
    expect(captured.rows).toHaveLength(0);
  });

  it("locale=en: payload válido se inserta con source='landing-en'", async () => {
    const fd = buildForm({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme LLC",
      locale: "en",
    });
    const res = await submitLead(fd);
    expect(res).toEqual({ ok: true });
    expect(captured.rows[0]?.source).toBe("landing-en");
  });

  it("locale desconocido cae a 'es' por defecto", async () => {
    const fd = buildForm({
      name: "Ana",
      email: "a@b.com",
      company: "Acme SL",
      locale: "fr", // no soportado
    });
    const res = await submitLead(fd);
    expect(res).toEqual({ ok: true });
    expect(captured.rows[0]?.source).toBe("landing");
  });

  it("captura user-agent y x-real-ip si no hay x-forwarded-for", async () => {
    headerStore["x-forwarded-for"] = null;
    headerStore["x-real-ip"] = "198.51.100.7";
    const fd = buildForm({
      name: "Ana",
      email: "a@b.com",
      company: "Acme SL",
    });
    const res = await submitLead(fd);
    expect(res.ok).toBe(true);
    expect(captured.rows[0]?.ip).toBe("198.51.100.7");
    // Restauramos para los tests siguientes (orden no garantizado pero
    // beforeEach no toca el header store).
    headerStore["x-forwarded-for"] = "203.0.113.42, 10.0.0.1";
    headerStore["x-real-ip"] = null;
  });
});
