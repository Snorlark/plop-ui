import type { Metadata } from "next";
import { GITHUB } from "./nav";
import { SITE_DESCRIPTION, SITE_URL } from "./site";

/** Every way people type the name. Search engines learn they're one thing from `alternateName`. */
export const BRAND = "PlopUI";
export const BRAND_SPELLINGS = ["Plop UI", "plop-ui", "Plop-UI", "plopui"];

/** Same words as app/opengraph-image.alt.txt, for pages that name the share image themselves. */
const SHARE_IMAGE_ALT =
  "PlopUI: hand-drawn UI, imperfect on purpose. The PlopUI logo on a torn sheet of paper on a green cutting mat, surrounded by PlopUI stickers: a to-do note, a Post sketch button, a switch, avatars, a Saved toast, a sticker pack and pencils.";

/** The home page's title: the brand, what it is, then the line people remember. */
export const HOME_TITLE = "PlopUI: hand-drawn React UI components, imperfect on purpose";

/**
 * One page's metadata: title, description, its canonical URL, and a share
 * preview that names the page instead of repeating the home page.
 * `path` is the page's own address, e.g. "/docs/tokens".
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const shareTitle = `${title} · ${BRAND}`;
  // A page that sets its own openGraph loses the inherited app/opengraph-image.png, so name it again.
  const images = [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: SHARE_IMAGE_ALT }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: BRAND, title: shareTitle, description, url: path, images },
    twitter: { card: "summary_large_image", title: shareTitle, description, images },
  };
}

/** schema.org for every page: the site (with its other spellings) and the code it documents. */
export const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BRAND,
      alternateName: BRAND_SPELLINGS,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${SITE_URL}/#code`,
      name: BRAND,
      alternateName: BRAND_SPELLINGS,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      codeRepository: GITHUB,
      license: `${GITHUB}/blob/main/LICENSE`,
      programmingLanguage: ["TypeScript", "React"],
      runtimePlatform: "React",
      sameAs: [GITHUB, "https://www.npmjs.com/package/@plop-ui/react"],
      author: { "@type": "Person", name: "Lark Sigmuond Babao", url: "https://github.com/Snorlark" },
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
  ],
};
