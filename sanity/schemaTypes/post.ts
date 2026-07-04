import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({
      name: "language",
      title: "Idioma",
      type: "string",
      options: {
        list: [
          { title: "Español", value: "es" },
          { title: "English", value: "en" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "es",
      validation: (rule) => rule.required(),
      description:
        "Los artículos en español se publican en /blog; los ingleses en /en/blog.",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      description: "La URL del artículo: atribuya.com/blog/<slug>.",
    }),
    defineField({
      name: "excerpt",
      title: "Extracto",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(200),
      description:
        "Resumen corto para la tarjeta del índice y la descripción SEO por defecto (máximo 200 caracteres).",
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Texto alternativo",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      validation: (rule) => rule.required(),
      description:
        "El artículo no aparece en la web hasta que llega esta fecha.",
    }),
    defineField({
      name: "body",
      title: "Cuerpo",
      type: "blockContent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seoTitle",
      title: "Título SEO (opcional)",
      type: "string",
      validation: (rule) => rule.max(60),
      description:
        "Sustituye al título en Google (máximo 60 caracteres). Si se deja vacío se usa el título normal.",
    }),
    defineField({
      name: "seoDescription",
      title: "Descripción SEO (opcional)",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(160),
      description:
        "Sustituye al extracto en Google (máximo 160 caracteres).",
    }),
  ],
  orderings: [
    {
      title: "Fecha de publicación (recientes primero)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      date: "publishedAt",
      media: "mainImage",
    },
    prepare({ title, language, date, media }) {
      const day = date ? new Date(date).toLocaleDateString("es-ES") : "sin fecha";
      return {
        title,
        subtitle: `${language === "en" ? "EN" : "ES"} · ${day}`,
        media,
      };
    },
  },
});
