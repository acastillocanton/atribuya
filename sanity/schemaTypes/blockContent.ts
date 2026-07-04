import { defineArrayMember, defineField, defineType } from "sanity";

// Cuerpo de los posts: bloques de texto con estilos acotados + imágenes con
// alt obligatorio (accesibilidad y SEO). Los enlaces solo admiten http(s),
// mailto o rutas relativas.
export const blockContent = defineType({
  name: "blockContent",
  title: "Cuerpo",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Título 2", value: "h2" },
        { title: "Título 3", value: "h3" },
        { title: "Cita", value: "blockquote" },
      ],
      lists: [
        { title: "Viñetas", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrita", value: "strong" },
          { title: "Cursiva", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Enlace",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (rule) =>
                  rule.required().uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto"],
                  }),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Texto alternativo",
          description: "Describe la imagen para lectores de pantalla y SEO.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
});
