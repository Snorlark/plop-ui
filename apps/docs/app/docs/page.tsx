import { permanentRedirect } from "next/navigation";

export default function DocsIndex() {
  // Permanent (308), so search engines index the real page, not /docs.
  permanentRedirect("/docs/getting-started");
}
