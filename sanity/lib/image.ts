import {
  createImageUrlBuilder,
  type ImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, isSanityConfigured, projectId } from "../env";

export type { SanityImageSource };

let builder: ReturnType<typeof createImageUrlBuilder> | null = null;

/** Builder de URLs del CDN de imágenes. `null` si Sanity no está configurado. */
export function urlFor(source: SanityImageSource): ImageUrlBuilder | null {
  if (!isSanityConfigured()) return null;
  builder ??= createImageUrlBuilder({ projectId, dataset });
  return builder.image(source);
}
