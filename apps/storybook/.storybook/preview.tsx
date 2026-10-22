import "@plop-ui/fonts/fonts.css";
import "@plop-ui/react/styles.css";
import { PlopProvider } from "@plop-ui/react";
import { surfaceNames, type SurfaceName } from "@plop-ui/tokens";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  globalTypes: {
    surface: {
      description: "Paper surface",
      toolbar: { title: "Surface", icon: "paintbrush", items: surfaceNames, dynamicTitle: true },
    },
    theme: {
      description: "Light or dark",
      toolbar: { title: "Theme", icon: "mirror", items: ["system", "light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { surface: "poster", theme: "light" },
  parameters: {
    layout: "fullscreen",
    a11y: { config: { rules: [] } },
    controls: { expanded: true },
  },
  decorators: [
    (Story, { globals, parameters }) => (
      <PlopProvider
        toastBackdrop={parameters.toastBackdrop}
        surface={(globals.surface as SurfaceName) ?? "poster"}
        theme={(globals.theme as "system" | "light" | "dark") ?? "light"}
        style={{ minHeight: "100vh", padding: "72px 40px 48px", boxSizing: "border-box" }}
      >
        <Story />
      </PlopProvider>
    ),
  ],
};

export default preview;
