export const PACKAGES = ["react", "tokens", "fonts"] as const;
export type Pkg = (typeof PACKAGES)[number];
