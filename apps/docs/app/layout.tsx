import "@plop-ui/react/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Providers } from "./_kit/Providers";
import { patrickHand, sketchpop } from "./fonts";
import { parseSurface, parseTheme, SURFACE_COOKIE, THEME_COOKIE } from "./surface";

export const metadata: Metadata = {
  title: { default: "Plop! — hand-lettered sticker UI kit", template: "%s · Plop!" },
  description: "A hand-lettered, one-ink sticker UI kit for real-time operations apps. Press it like you mean it.",
};

/**
 * The surface lives in a cookie and is read here, so the server renders the
 * right paper on the first paint (no flash of the default surface).
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const surface = parseSurface(jar.get(SURFACE_COOKIE)?.value);
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${sketchpop.variable} ${patrickHand.variable}`}
      data-plop-surface={surface}
      data-plop-theme={theme === "system" ? undefined : theme}
    >
      <body className="plop-surface">
        <Providers surface={surface} theme={theme} paint={false}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
