/**
 * Excel propio de un comercial: bloque de cabecera (nombre / fecha
 * incorporación / ficha / periodo / total) + tabla con sus reseñas
 * `counted` no duplicadas del rango. Filtrado anti-fraude (mig 015):
 * solo principales `counted`, no `removed_at`.
 *
 * Llamado desde `app/api/export/sales/[id]/route.ts`. Mantener este
 * módulo sin side effects facilita los tests unit.
 *
 * Portado del producto base single-tenant. Adaptado a Atribuya: sin rol
 * `office_director` ni columna `department` — la "Zona" es directamente la
 * ficha (location) del comercial.
 */

import { buildGoogleReviewListUrl } from "@/lib/google/review-url";
import { excelSafe } from "@/lib/reports/excel-safe";

export type SalesReportProfile = {
  full_name: string;
  joined_at: string | null;
  location_name: string | null;
};

export type SalesReportReview = {
  google_created_at: string;
  client_name: string | null;
  rating: number;
  author_name: string;
  place_id: string | null;
};

export type SalesReportRange = {
  from: string;
  to: string;
  label: string;
};

export type SalesReportInput = {
  profile: SalesReportProfile;
  range: SalesReportRange;
  reviews: SalesReportReview[];
};

/**
 * Formatea ISO date (o null) a "DD/MM/YYYY" en formato español. Usa
 * "—" como fallback. Función pura — testeable.
 */
export function formatJoinedAtForExcel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Zona del comercial = su ficha (location). "—" si no tiene. Función pura.
 */
export function formatZoneForExcel(locationName: string | null): string {
  return locationName ?? "—";
}

/**
 * Formatea ISO timestamp a "DD/MM/YYYY HH:mm" en formato español.
 * Pura, sin TZ tricks: usa la TZ del runtime (servidor → UTC en Vercel).
 */
export function formatReviewDateForExcel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/**
 * Convierte el rating numérico (1-5) a una representación textual con
 * estrellas para mostrar en la celda. Mantiene el número entre paréntesis
 * para que sea fácil de filtrar/ordenar en Excel.
 */
export function formatRatingForExcel(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return `${"★".repeat(clamped)}${"☆".repeat(5 - clamped)} (${clamped})`;
}

/**
 * Slug del nombre del archivo. Reemplaza chars no ASCII por guión, y
 * trims dobles. Pensado para `Content-Disposition` sin necesitar
 * encoding RFC 5987.
 */
export function buildSalesReportFilename(
  profileFullName: string,
  range: SalesReportRange,
): string {
  const slug = profileFullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `resenas-${slug || "comercial"}-${range.from}-a-${range.to}.xlsx`;
}

/**
 * Genera el Excel del comercial individual y devuelve un Buffer listo
 * para servir en la respuesta HTTP. ExcelJS se importa dinámicamente
 * (~500KB) para no engrosar el bundle del resto de la app.
 */
export async function buildSalesReport(
  input: SalesReportInput,
): Promise<Buffer> {
  // Import dinámico — patrón del repo (ver app/api/export/reviews/route.ts).
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Atribuya";
  wb.created = new Date();

  const ws = wb.addWorksheet("Reseñas");

  // Anchos de columna (orientativo, Excel los respeta).
  ws.columns = [
    { width: 22 }, // A · Fecha o Label
    { width: 28 }, // B · Cliente o Valor cabecera
    { width: 22 }, // C · Autor
    { width: 14 }, // D · Valoración
    { width: 22 }, // E · Enlace
  ];

  const titleCell = ws.getCell("A1");
  titleCell.value = "Reseñas del comercial";
  titleCell.font = { name: "Calibri", size: 14, bold: true };

  // Bloque cabecera (filas 3-7).
  const headerRows: Array<[string, string]> = [
    ["Comercial:", input.profile.full_name],
    ["Fecha incorporación:", formatJoinedAtForExcel(input.profile.joined_at)],
    ["Ficha:", formatZoneForExcel(input.profile.location_name)],
    ["Periodo:", input.range.label],
    ["Total reseñas:", String(input.reviews.length)],
  ];
  headerRows.forEach(([label, value], i) => {
    const rowIdx = 3 + i;
    const labelCell = ws.getCell(`A${rowIdx}`);
    labelCell.value = label;
    labelCell.font = { bold: true, color: { argb: "FF666666" } };
    const valueCell = ws.getCell(`B${rowIdx}`);
    valueCell.value = value;
  });

  // Fila vacía (8) y tabla a partir de la 9.
  const tableHeaderRow = 9;
  const headers = ["Fecha", "Cliente", "Autor", "Valoración", "Enlace"];
  headers.forEach((label, col) => {
    const cell = ws.getCell(tableHeaderRow, col + 1);
    cell.value = label;
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
    };
  });

  // Filas de datos. Ordenadas por google_created_at desc (más reciente
  // arriba, igual que las pantallas del producto).
  const sorted = [...input.reviews].sort((a, b) =>
    b.google_created_at.localeCompare(a.google_created_at),
  );

  if (sorted.length === 0) {
    // Nota informativa cuando el comercial no tiene reseñas en el rango.
    const noteRow = tableHeaderRow + 1;
    const noteCell = ws.getCell(`A${noteRow}`);
    noteCell.value = "Sin reseñas atribuidas en este periodo.";
    noteCell.font = { italic: true, color: { argb: "FF888888" } };
    ws.mergeCells(`A${noteRow}:E${noteRow}`);
  } else {
    sorted.forEach((r, i) => {
      const rowIdx = tableHeaderRow + 1 + i;
      ws.getCell(rowIdx, 1).value = formatReviewDateForExcel(r.google_created_at);
      ws.getCell(rowIdx, 2).value = excelSafe(r.client_name ?? "—");
      ws.getCell(rowIdx, 3).value = excelSafe(r.author_name);
      ws.getCell(rowIdx, 4).value = formatRatingForExcel(r.rating);
      const linkCell = ws.getCell(rowIdx, 5);
      const url = buildGoogleReviewListUrl(r.place_id);
      if (url) {
        linkCell.value = { text: "Ver en Google", hyperlink: url };
        linkCell.font = { color: { argb: "FF1A73E8" }, underline: true };
      } else {
        linkCell.value = "—";
      }
    });
  }

  // exceljs devuelve un ArrayBuffer; Buffer.from cubre el tipo para
  // NextResponse en Node runtime.
  const ab = await wb.xlsx.writeBuffer();
  return Buffer.from(ab as ArrayBuffer);
}
