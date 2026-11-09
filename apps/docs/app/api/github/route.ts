import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/** GitHub calls this on every star and unstar, so the header's star count refreshes right away instead of hourly. */
export async function POST(req: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 500 });
  const body = await req.text();
  // Only GitHub knows the secret: without this check anyone could force every page to rebuild.
  const got = Buffer.from(req.headers.get("x-hub-signature-256") ?? "");
  const want = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return new Response("Bad signature", { status: 401 });
  if (req.headers.get("x-github-event") === "star") revalidateTag("stars");
  return new Response("ok");
}
