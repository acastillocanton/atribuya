import type { PortableTextBlock } from "@portabletext/react";

export type FaqItem = { question: string; answer: string };

type TextBlock = {
  _type?: string;
  style?: string;
  children?: Array<{ text?: string }>;
};

// Encabezados H2 que marcan el inicio de la sección de FAQ (ES + EN).
// Se comparan normalizados (minúsculas, sin acentos ni signos).
const FAQ_HEADINGS = ["preguntas frecuentes", "frequently asked questions"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // marcas diacríticas combinantes (acentos)
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

const plainText = (block: TextBlock) =>
  (block.children ?? [])
    .map((c) => (typeof c?.text === "string" ? c.text : ""))
    .join("")
    .trim();

// Extrae los pares pregunta/respuesta de la sección de FAQ del cuerpo Portable
// Text para emitir un rich result FAQPage. Estructura esperada (la que generan
// los seeds): un H2 de FAQ, y debajo pares de H3 (pregunta) + uno o más párrafos
// (respuesta), hasta el siguiente H2. Devuelve [] si no hay sección de FAQ o si
// hay menos de 2 pares (Google exige al menos 2 para el rich result).
export function extractFaq(
  body: PortableTextBlock[] | null | undefined,
): FaqItem[] {
  if (!Array.isArray(body)) return [];

  const startIdx = body.findIndex((raw) => {
    const b = raw as TextBlock;
    return b?._type === "block" && b.style === "h2" && FAQ_HEADINGS.includes(normalize(plainText(b)));
  });
  if (startIdx === -1) return [];

  const items: FaqItem[] = [];
  let current: FaqItem | null = null;

  for (let i = startIdx + 1; i < body.length; i++) {
    const b = body[i] as TextBlock;
    if (b?._type !== "block") continue;
    if (b.style === "h2") break; // fin de la sección de FAQ

    if (b.style === "h3") {
      if (current && current.answer) items.push(current);
      current = { question: plainText(b), answer: "" };
    } else if (current) {
      const text = plainText(b);
      if (text) current.answer = current.answer ? `${current.answer} ${text}` : text;
    }
  }
  if (current && current.answer) items.push(current);

  return items.filter((it) => it.question && it.answer).length >= 2 ? items : [];
}
