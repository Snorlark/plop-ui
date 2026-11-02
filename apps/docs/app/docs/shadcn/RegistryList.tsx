import Link from "next/link";
import { COMPONENT_DOCS } from "../../_site/registry";
import { BlockPreview } from "./BlockPreview";

/** Where the registry is served (same default as scripts/build-registry.mjs), so copied commands always work. */
const REGISTRY = "https://plopui.com";

/** The blocks in registry/blocks (kept in step with that folder by the registry e2e test). */
const BLOCKS = [
  { name: "settings-panel", title: "Settings panel", text: "Profile fields, notification switches, a paper picker, and a Save button that toasts with a buddy." },
  { name: "signup-card", title: "Sign-up card", text: "Name, email and password with friendly errors, a terms checkbox, and a celebration when it works." },
  { name: "empty-state", title: "Empty state", text: "A buddy, a short message and one clear next step, for lists with nothing in them yet." },
];

/** The registry items as a list: what each one is, its install command, and (for components) its docs page. */
export function RegistryList({ kind }: { kind: "blocks" | "components" }) {
  const rows =
    kind === "blocks"
      ? BLOCKS.map((b) => ({ name: b.name, title: b.title, text: b.text, href: undefined }))
      : Object.entries(COMPONENT_DOCS).map(([slug, d]) => ({ name: slug, title: d.title, text: undefined, href: `/docs/components/${slug}` }));
  return (
    <ul className="registry-list">
      {rows.map((r) => (
        <li key={r.name}>
          <strong>{r.href ? <Link href={r.href}>{r.title}</Link> : r.title}</strong>
          {r.text && <span> {r.text}</span>}
          {kind === "blocks" && <BlockPreview name={r.name} />}
          <code>npx shadcn@latest add {`${REGISTRY}/r/${r.name}.json`}</code>
        </li>
      ))}
    </ul>
  );
}
