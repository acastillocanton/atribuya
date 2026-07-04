import Image from "next/image";
import Link from "next/link";
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";

// Render del Portable Text con la estética editorial de la landing.
export const ptComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = urlFor(value)?.width(1200).fit("max").url();
      if (!url) return null;
      const alt = typeof value?.alt === "string" ? value.alt : "";
      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-lg border border-line">
            <Image
              src={url}
              alt={alt}
              width={1200}
              height={675}
              sizes="(max-width: 768px) 100vw, 720px"
              className="h-auto w-full"
            />
          </div>
          {alt ? (
            <figcaption className="mt-2 text-center text-xs text-ink-4">
              {alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="my-5 leading-[1.75] text-ink-2">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 mb-4 font-display text-2xl font-medium tracking-tight text-ink">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 font-display text-xl font-medium tracking-tight text-ink">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-line-strong pl-5 italic text-ink-3">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-5 list-disc space-y-2 pl-6 text-ink-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-5 list-decimal space-y-2 pl-6 text-ink-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const cls =
        "underline decoration-line-strong underline-offset-4 hover:decoration-ink";
      if (href.startsWith("/")) {
        return (
          <Link href={href} className={cls}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    },
  },
};
