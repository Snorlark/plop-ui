import "@plop-ui/react/styles.css";
import "./globals.css";
import "./site.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./_kit/Providers";
import { SiteFilters } from "./_site/Wordmark";
import { patrickHand, sketchpop } from "./fonts";

export const metadata: Metadata = {
  title: { default: "PlopUI — hand-drawn UI for apps that can’t wait", template: "%s · PlopUI" },
  description: "A hand-lettered, one-ink sticker UI kit for real-time operations apps. Press it like you mean it.",
};

/**
 * The site itself is printed on poster paper in light mode, so every page can
 * be static. Other surfaces and dark mode live in the Playground and on /kit.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sketchpop.variable} ${patrickHand.variable}`} data-plop-surface="poster" data-plop-theme="light">
      <body className="plop-surface">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteFilters />
        <Providers surface="poster" theme="light" paint={false}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
