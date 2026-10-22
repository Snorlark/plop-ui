import "@plop-ui/react/styles.css";
import "./globals.css";
import { PlopProvider } from "@plop-ui/react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { patrickHand, sketchpop } from "./fonts";

export const metadata: Metadata = {
  title: "Barangay Dispatch · a Plop! demo",
  description: "A live incident queue built only from Plop! components: Server-Sent Events, a Server Action and useOptimistic in Next.js.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sketchpop.variable} ${patrickHand.variable}`}>
      <body>
        <PlopProvider surface="poster" theme="light">
          {children}
        </PlopProvider>
      </body>
    </html>
  );
}
