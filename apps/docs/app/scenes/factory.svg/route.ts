import { FACTORY_SCENE } from "../../_site/footerScene";

export const dynamic = "force-static";

/** The footer's sticker-factory drawing, fetched by LazyScene when the footer nears the screen (#67). */
export function GET() {
  return new Response(FACTORY_SCENE, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" } });
}
