import type { Metadata } from "next";
import { NOT_FOUND_SCENE } from "./_site/notFoundScene";
import { NotFound } from "./_site/NotFound";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Every unknown address lands here: one screen-sized scene, no site header (its buttons lead out). Next.js sends it with a 404 status. */
export default function NotFoundPage() {
  return (
    <div className="site">
      <NotFound
        scene={<svg aria-hidden="true" focusable="false" viewBox="0 0 1200 470" preserveAspectRatio="xMidYMax meet" dangerouslySetInnerHTML={{ __html: NOT_FOUND_SCENE }} />}
      />
    </div>
  );
}
