import type { ReactNode } from "react";
import { PlopProvider } from "@plop-ui/react";

/**
 * PlopProvider: wrap your app once. Pick the paper (poster, mat, notebook, kraft, riso), light/dark/system,
 * and whether presses buzz and click. The styles are loaded by components/plop/plop-provider.tsx (plop-setup).
 */
export function ProviderExample({ children }: { children: ReactNode }) {
  return (
    <PlopProvider surface="poster" theme="system" haptics sound={false} reducedMotion="system">
      {children}
    </PlopProvider>
  );
}
