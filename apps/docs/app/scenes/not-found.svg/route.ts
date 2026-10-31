import { NOT_FOUND_SCENE } from "../../_site/notFoundScene";

export const dynamic = "force-static";

/** The 404 page's drawing. Fetched on the 404 page only, so it stays out of every other page's payload (#67). */
export function GET() {
  return new Response(NOT_FOUND_SCENE, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" } });
}
