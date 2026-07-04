import type { PortableTextBlock } from "@portabletext/react";
import { slugify } from "@/lib/utils";

export type TocItem = { id: string; text: string; level: 2 | 3 };

type HeadingBlock = {
  _type?: string;
  _key?: string;
  style?: string;
  children?: Array<{ text?: string }>;
};

// Extrae los encabezados h2/h3 del cuerpo Portable Text para la tabla de
// contenidos. Devuelve `items` (para el índice) y `idByKey` (mapa _key→id)
// para que los renderers de heading usen EXACTAMENTE el mismo id que el índice,
// incluso con textos repetidos (desduplicado en orden: -2, -3...).
export function extractToc(body: PortableTextBlock[] | null | undefined): {
  items: TocItem[];
  idByKey: Record<string, string>;
} {
  const items: TocItem[] = [];
  const idByKey: Record<string, string> = {};
  const used = new Map<string, number>();
  if (!Array.isArray(body)) return { items, idByKey };

  for (const raw of body) {
    const block = raw as HeadingBlock;
    if (block?._type !== "block") continue;
    if (block.style !== "h2" && block.style !== "h3") continue;
    const text = (block.children ?? [])
      .map((c) => (typeof c?.text === "string" ? c.text : ""))
      .join("")
      .trim();
    if (!text) continue;

    const base = slugify(text) || "seccion";
    const n = used.get(base) ?? 0;
    const id = n === 0 ? base : `${base}-${n + 1}`;
    used.set(base, n + 1);

    if (typeof block._key === "string") idByKey[block._key] = id;
    items.push({ id, text, level: block.style === "h2" ? 2 : 3 });
  }

  return { items, idByKey };
}
