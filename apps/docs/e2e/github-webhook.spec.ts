import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

// Matches GITHUB_WEBHOOK_SECRET in playwright.config.ts.
const sign = (body: string) => `sha256=${createHmac("sha256", "e2e-webhook-secret").update(body).digest("hex")}`;
const body = JSON.stringify({ action: "created", repository: { full_name: "Snorlark/plop-ui" } });

test("the star webhook only accepts GitHub's signature", async ({ request }) => {
  const post = (signature?: string) => request.post("/api/github", {
    data: body,
    headers: { "content-type": "application/json", "x-github-event": "star", ...(signature ? { "x-hub-signature-256": signature } : {}) },
  });
  expect((await post()).status()).toBe(401);
  expect((await post("sha256=nope")).status()).toBe(401);
  expect((await post(sign(body + " "))).status()).toBe(401);
  const ok = await post(sign(body));
  expect(ok.status()).toBe(200);
  expect(await ok.text()).toBe("ok");
});
