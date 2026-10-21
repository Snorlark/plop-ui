import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { PlopProvider, type PlopProviderProps } from "../src/PlopProvider/PlopProvider";

/** Renders inside a PlopProvider; reduced motion by default so removals finish without waiting for animations. */
export function renderWithPlop(ui: ReactElement, provider: Partial<PlopProviderProps> = {}, options?: RenderOptions) {
  return render(
    <PlopProvider reducedMotion="always" {...provider}>
      {ui}
    </PlopProvider>,
    options,
  );
}
