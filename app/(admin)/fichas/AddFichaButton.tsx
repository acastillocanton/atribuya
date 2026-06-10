"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GhostBtn } from "@/components/ui/GhostBtn";
import { SyncNowButton } from "@/components/ui/SyncNowButton";
import { createLocation, searchPlaces } from "./actions";
import type { PlaceCandidate } from "@/lib/google/places";

type Step = "search" | "choose" | "manual" | "confirm" | "done";

const PLACE_ID_DOCS =
  "https://developers.google.com/maps/documentation/places/web-service/place-id";

export function AddFichaButton({
  atLimit = false,
  limit,
}: {
  /** True cuando la org ya alcanzó el tope de fichas de su plan. */
  atLimit?: boolean;
  /** Tope del plan, para el tooltip. */
  limit?: number;
} = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("search");

  // Paso 1: búsqueda
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();

  // Paso 3: confirmación / guardado
  const [name, setName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [chosen, setChosen] = useState<PlaceCandidate | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [createdId, setCreatedId] = useState<string | null>(null);

  function reset() {
    setStep("search");
    setQuery("");
    setCandidates([]);
    setSearchError(null);
    setName("");
    setPlaceId("");
    setChosen(null);
    setSaveError(null);
    setCreatedId(null);
  }

  function close() {
    setOpen(false);
    // Refresca la lista: si se creó una ficha, aparece la fila nueva.
    if (createdId) router.refresh();
    reset();
  }

  function runSearch() {
    if (query.trim().length < 3) {
      setSearchError("Escribe al menos 3 caracteres.");
      return;
    }
    setSearchError(null);
    startSearch(async () => {
      const result = await searchPlaces({ query });
      if (!result.ok) {
        setSearchError(result.error);
        return;
      }
      setCandidates(result.candidates);
      setStep("choose");
    });
  }

  function pickCandidate(c: PlaceCandidate) {
    setChosen(c);
    setName(c.name);
    setPlaceId(c.placeId);
    setSaveError(null);
    setStep("confirm");
  }

  function goManual() {
    setChosen(null);
    setName("");
    setPlaceId("");
    setSaveError(null);
    setStep("manual");
  }

  function save() {
    if (name.trim().length < 2) {
      setSaveError("Ponle un nombre a la ficha (mínimo 2 caracteres).");
      return;
    }
    setSaveError(null);
    startSave(async () => {
      const result = await createLocation({
        name,
        googlePlaceId: placeId.trim() === "" ? null : placeId,
      });
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      setCreatedId(result.id ?? null);
      setStep("done");
    });
  }

  const subtitle: Record<Step, string> = {
    search: "Busca tu negocio en Google y dejamos la ficha lista para traer reseñas.",
    choose: "Elige tu negocio de la lista. Si no aparece, puedes meter el Place ID a mano.",
    manual: "Pega el Place ID de tu ficha de Google.",
    confirm: "Revisa los datos y guarda la ficha.",
    done: "Ficha creada. Las reseñas recientes empezarán a entrar solas.",
  };

  return (
    <>
      <GhostBtn
        primary
        onClick={() => setOpen(true)}
        disabled={atLimit}
        title={
          atLimit
            ? `Has alcanzado el tope de ${limit} ${limit === 1 ? "ficha" : "fichas"} de tu plan. Para añadir más, amplía el plan desde soporte.`
            : undefined
        }
        style={atLimit ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
      >
        + Añadir ficha
      </GhostBtn>
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(20,20,22,0.32)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            style={{
              width: 520,
              maxWidth: "100%",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 22px 14px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 500 }}>
                Nueva ficha
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  marginTop: 2,
                }}
              >
                Añadir ficha de Google Business
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  lineHeight: 1.5,
                }}
              >
                {subtitle[step]}
              </p>
            </div>

            <div
              style={{
                padding: "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {step === "search" && (
                <>
                  <Field
                    label="Nombre del negocio y ciudad"
                    hint="Ej. Acme Promotora, Madrid"
                  >
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          runSearch();
                        }
                      }}
                      maxLength={160}
                      placeholder="Acme Promotora, Madrid"
                      style={inputStyle}
                    />
                  </Field>
                  {searchError && <Alert>{searchError}</Alert>}
                  <button
                    type="button"
                    onClick={goManual}
                    style={linkBtnStyle}
                  >
                    Introducir el Place ID a mano
                  </button>
                </>
              )}

              {step === "choose" && (
                <>
                  {candidates.length === 0 ? (
                    <Alert tone="neutral">
                      No encontramos resultados para «{query}». Prueba a afinar el
                      nombre o la ciudad.
                    </Alert>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        maxHeight: 320,
                        overflow: "auto",
                      }}
                    >
                      {candidates.map((c) => (
                        <button
                          key={c.placeId}
                          type="button"
                          onClick={() => pickCandidate(c)}
                          style={candidateStyle}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                            {c.name}
                          </div>
                          {c.address && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--ink-3)",
                                marginTop: 2,
                              }}
                            >
                              {c.address}
                            </div>
                          )}
                          {c.rating !== null && (
                            <div
                              style={{
                                fontSize: 11.5,
                                color: "var(--ink-4)",
                                marginTop: 3,
                              }}
                            >
                              ★ {c.rating.toFixed(1)}
                              {c.totalRatings !== null
                                ? ` · ${c.totalRatings} reseñas`
                                : ""}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={goManual} style={linkBtnStyle}>
                    No encuentro mi negocio. Introducir el Place ID a mano.
                  </button>
                </>
              )}

              {step === "manual" && (
                <>
                  <Field label="Nombre de la ficha" hint="Ej. Acme Promotora · Centro">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      minLength={2}
                      maxLength={120}
                      style={inputStyle}
                    />
                  </Field>
                  <Field
                    label="Google Place ID"
                    hint={`Lo encuentras en ${PLACE_ID_DOCS}`}
                  >
                    <input
                      value={placeId}
                      onChange={(e) => setPlaceId(e.target.value)}
                      maxLength={250}
                      placeholder="ChIJ..."
                      style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                    />
                  </Field>
                  {saveError && <Alert>{saveError}</Alert>}
                </>
              )}

              {step === "confirm" && (
                <>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--surface-2, rgba(0,0,0,0.02))",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                    }}
                  >
                    {chosen ? (
                      <>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                          {chosen.name}
                        </div>
                        {chosen.address && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--ink-3)",
                              marginTop: 2,
                            }}
                          >
                            {chosen.address}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        Place ID introducido a mano
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-4)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 6,
                        wordBreak: "break-all",
                      }}
                    >
                      {placeId}
                    </div>
                  </div>
                  <Field label="Nombre de la ficha" hint="Nombre interno, lo ves tú en el panel.">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      minLength={2}
                      maxLength={120}
                      style={inputStyle}
                    />
                  </Field>
                  {saveError && <Alert>{saveError}</Alert>}
                </>
              )}

              {step === "done" && (
                <>
                  <Alert tone="ok">
                    Ficha «{name.trim()}» creada con su Place ID.
                  </Alert>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      color: "var(--ink-3)",
                      lineHeight: 1.5,
                    }}
                  >
                    Las reseñas recientes empezarán a entrar en la próxima
                    sincronización (cada hora). Puedes traerlas ahora mismo:
                  </p>
                  {createdId && (
                    <SyncNowButton
                      locationId={createdId}
                      label="Sincronizar ahora"
                      variant="ghost"
                    />
                  )}
                </>
              )}
            </div>

            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div>
                {(step === "choose" || step === "manual") && (
                  <GhostBtn
                    type="button"
                    onClick={() => setStep("search")}
                    disabled={isSearching || isSaving}
                  >
                    ← Volver a buscar
                  </GhostBtn>
                )}
                {step === "confirm" && (
                  <GhostBtn
                    type="button"
                    onClick={() => setStep(chosen ? "choose" : "manual")}
                    disabled={isSaving}
                  >
                    ← Volver
                  </GhostBtn>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {step === "done" ? (
                  <GhostBtn primary type="button" onClick={close}>
                    Cerrar
                  </GhostBtn>
                ) : (
                  <>
                    <GhostBtn type="button" onClick={close} disabled={isSearching || isSaving}>
                      Cancelar
                    </GhostBtn>
                    {step === "search" && (
                      <GhostBtn primary type="button" onClick={runSearch} disabled={isSearching}>
                        {isSearching ? "Buscando…" : "Buscar"}
                      </GhostBtn>
                    )}
                    {step === "manual" && (
                      <GhostBtn
                        primary
                        type="button"
                        onClick={() => {
                          if (placeId.trim() === "") {
                            setSaveError("Pega el Place ID de tu ficha.");
                            return;
                          }
                          setSaveError(null);
                          setStep("confirm");
                        }}
                      >
                        Continuar
                      </GhostBtn>
                    )}
                    {step === "confirm" && (
                      <GhostBtn primary type="button" onClick={save} disabled={isSaving}>
                        {isSaving ? "Guardando…" : "Guardar ficha"}
                      </GhostBtn>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface)",
  border: "1px solid var(--line-strong)",
  borderRadius: 9,
  fontSize: 13,
  color: "var(--ink)",
};

const linkBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 12.5,
  color: "var(--ink-3)",
  textDecoration: "underline",
  cursor: "pointer",
  textAlign: "left",
  alignSelf: "flex-start",
};

const candidateStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  background: "var(--surface)",
  border: "1px solid var(--line-strong)",
  borderRadius: 10,
  cursor: "pointer",
  color: "var(--ink)",
};

function Alert({
  children,
  tone = "warn",
}: {
  children: React.ReactNode;
  tone?: "warn" | "ok" | "neutral";
}) {
  const palette =
    tone === "ok"
      ? { bg: "var(--ok-bg, rgba(16,122,87,0.1))", fg: "var(--ok, #0a7d57)" }
      : tone === "neutral"
        ? { bg: "var(--surface-2, rgba(0,0,0,0.03))", fg: "var(--ink-3)" }
        : { bg: "var(--warn-bg)", fg: "var(--warn)" };
  return (
    <div
      role={tone === "warn" ? "alert" : "status"}
      style={{
        padding: "8px 10px",
        background: palette.bg,
        color: palette.fg,
        borderRadius: 8,
        fontSize: 12.5,
        lineHeight: 1.45,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--ink-4)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
      {hint && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-4)" }}>{hint}</div>
      )}
    </div>
  );
}
