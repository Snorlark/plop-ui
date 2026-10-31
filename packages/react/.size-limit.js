// Size budgets (pnpm size, run in CI). Moved here from package.json so a check can tweak esbuild.
//
// Button is measured "up front": dynamic imports stay unbundled, so only what a page pays to render a
// Button counts. The burst drawings and the other Buddy moods load later, and only if a Button asks for
// them (#67). The whole-library check still counts everything.
const lazyChunksExternal = {
  name: "lazy-chunks-external",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => (args.kind === "dynamic-import" ? { path: args.path, external: true } : undefined));
  },
};
const upFront = { modifyEsbuildConfig: (config) => ({ ...config, plugins: [...(config.plugins ?? []), lazyChunksExternal] }) };

export default [
  { name: "Button (up front)", path: "dist/Button/Button.js", import: "{ Button }", ignore: ["react", "react-dom"], limit: "5 kB", ...upFront },
  { name: "whole library (JS)", path: "dist/index.js", import: "*", ignore: ["react", "react-dom"], limit: "40 kB" },
  { name: "styles.css", path: "dist/styles.css", limit: "15 kB" },
];
