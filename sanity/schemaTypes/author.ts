import { defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Autor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Cargo",
      type: "string",
      description: "Por ejemplo: Equipo Atribuya, Fundador. Se usa como jobTitle en los datos estructurados.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      description: "La URL de la página de autor: atribuya.com/blog/autor/<slug>.",
    }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Biografía",
      type: "text",
      rows: 5,
      description: "Presentación del autor: experiencia y áreas de especialidad (refuerza el E-E-A-T).",
    }),
    defineField({
      name: "sameAs",
      title: "Perfiles (sameAs)",
      type: "array",
      of: [{ type: "url" }],
      description:
        "Enlaces a perfiles verificables (LinkedIn, X, web). Conectan al autor con su identidad pública en los datos estructurados.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "image" },
  },
});
