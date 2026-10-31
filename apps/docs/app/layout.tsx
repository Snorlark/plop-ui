import "@plop-ui/react/styles.css";
import { SCROLL_SCRIPT } from "./_site/scrollRestore";
import "./globals.css";
import "./site.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers, SURFACE_SCRIPT } from "./_kit/Providers";
import { GITHUB } from "./_site/nav";
import { SITE_DESCRIPTION, SITE_URL } from "./_site/site";
import { HOME_TITLE, JSON_LD } from "./_site/meta";
import { RideAlong } from "./_site/RideAlong";
import { SiteFilters } from "./_site/Wordmark";
import { patrickHand, sketchpop } from "./fonts";
import { OffscreenPause } from "./_site/OffscreenPause";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: "%s · PlopUI" },
  description: SITE_DESCRIPTION,
  applicationName: "PlopUI",
  authors: [{ name: "Lark Sigmuond Babao", url: GITHUB }],
  keywords: ["PlopUI", "Plop UI", "plop-ui", "React UI library", "React components", "hand-drawn UI", "Next.js", "accessible components", "playful UI", "design system", "sticker UI"],
  // Shared previews on X, Slack, Discord, LinkedIn: the image is app/opengraph-image.png.
  openGraph: { type: "website", siteName: "PlopUI", title: HOME_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: SITE_DESCRIPTION },
};

/**
 * The site is printed on paper (poster) or laid on the cutting mat, picked by
 * the header toggle and remembered per device. Pages stay static: a tiny
 * script sets the surface on <html> before paint. Other surfaces and dark
 * mode live in the Playground.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sketchpop.variable} ${patrickHand.variable}`} data-plop-surface="poster" data-plop-theme="light" suppressHydrationWarning>
      <head>
        {/* Paper or cutting mat: applied before the first paint so a static page never flashes the wrong surface. */}
        <script dangerouslySetInnerHTML={{ __html: SURFACE_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCROLL_SCRIPT }} />
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
          <OffscreenPause />
        </Providers>
      </body>
    </html>
  );
}
