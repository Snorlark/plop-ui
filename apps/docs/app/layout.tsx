import "@plop-ui/react/styles.css";
import "./globals.css";
import "./site.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers, SURFACE_SCRIPT } from "./_kit/Providers";
import { GITHUB } from "./_site/nav";
import { RideAlong } from "./_site/RideAlong";
import { SiteFilters } from "./_site/Wordmark";
import { patrickHand, sketchpop } from "./fonts";

export const metadata: Metadata = {
  title: { default: "PlopUI — hand-drawn UI for apps that can’t wait", template: "%s · PlopUI" },
  description: "A hand-lettered, one-ink sticker UI kit for real-time operations apps. Press it like you mean it.",
};

/** Tells search engines what PlopUI is (schema.org). */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "PlopUI",
  description: "Hand-drawn React UI component library for real-time operations apps: dispatch, field service and ticketing. Accessible to WCAG AA, server-rendered with Next.js.",
  codeRepository: GITHUB,
  programmingLanguage: ["TypeScript", "React"],
  author: { "@type": "Person", name: "Lark Sigmuond Babao" },
};

/**
 * The site is printed on paper (poster) or laid on the cutting mat, picked by
 * the header toggle and remembered per device. Pages stay static: a tiny
 * script sets the surface on <html> before paint. Other surfaces and dark
 * mode live in the Playground and on /kit.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sketchpop.variable} ${patrickHand.variable}`} data-plop-surface="poster" data-plop-theme="light" suppressHydrationWarning>
      <head>
        {/* Paper or cutting mat: applied before the first paint so a static page never flashes the wrong surface. */}
        <script dangerouslySetInnerHTML={{ __html: SURFACE_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="plop-surface">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteFilters />
        <Providers theme="light" paint={false}>
          {children}
          <RideAlong />
        </Providers>
      </body>
    </html>
  );
}
