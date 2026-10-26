import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // The e2e tests build into their own folder so they never clobber a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  // /kit was a one-page copy of every component; old links land on the component docs instead.
  redirects: async () => [{ source: "/kit", destination: "/docs/components/button", permanent: true }],
};

const withMDX = createMDX({ options: { remarkPlugins: [remarkGfm] } });

export default withMDX(nextConfig);
