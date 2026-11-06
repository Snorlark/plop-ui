import { expect, test } from "@playwright/test";

/** The shadcn registry (public/r) is built with the site: every item is valid JSON with real file contents. */
test("shadcn registry: index and items", async ({ request, isMobile }) => {
  test.skip(isMobile, "no page rendering involved");
  const index = await request.get("/r/registry.json");
  expect(index.status()).toBe(200);
  const { items } = (await index.json()) as { items: Array<{ name: string }> };
  expect(items.length).toBeGreaterThan(20);
  for (const name of ["plop-setup", "button", "select", "toast"]) {
    const res = await request.get(`/r/${name}.json`);
    expect(res.status(), name).toBe(200);
    const item = (await res.json()) as { dependencies?: string[]; files: Array<{ target: string; content: string }> };
    expect(item.dependencies).toContain("@plop-ui/react");
    const [file] = item.files;
    expect(file?.content.length ?? 0, name).toBeGreaterThan(50);
    expect(file?.target).toMatch(/^components\/plop\//);
  }
});

test("Install with shadcn page lists every block in the registry", async ({ page, request }) => {
  const { items } = (await (await request.get("/r/registry.json")).json()) as { items: Array<{ name: string; type: string }> };
  const blocks = items.filter((i) => i.type === "registry:block");
  expect(blocks.length).toBeGreaterThan(0);
  await page.goto("/docs/shadcn");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/install with shadcn/i);
  for (const b of blocks) await expect(page.getByText(`@plopui/${b.name}`).first()).toBeAttached();
});
