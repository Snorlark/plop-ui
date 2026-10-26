import type { Metadata } from "next";
import { GITHUB } from "../_site/nav";
import { SiteFooter } from "../_site/SiteFooter";
import { SiteHeader } from "../_site/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy",
  description: "PlopUI's docs site has no accounts, no analytics and no tracking. Here's the little it keeps on your device, and why.",
};

/** What the site keeps on the visitor's device. Keep this in step with the code when a new key is added. */
const STORED: Array<[string, string]> = [
  ["plop-site-surface", "Paper or cutting mat, from the header toggle."],
  ["plop-feedback", "Whether haptics and sound are on."],
  ["plop-site-recent", "Your last five picks in search, offered as recent searches."],
  ["plop-ride-along-v1, plop-ride-along-hint", "Which Ride-along stops you've stamped, and that you've seen the “Not sure where to start?” hint."],
  ["plop-board-v1, plop-lettering-v1", "Your sticker board and lettering in the playground, so they're still there next time."],
];

export default function PrivacyPage() {
  return (
    <div className="site site--docs">
      <SiteHeader />
      <main id="main" className="doc-main content legal-page">
        <h1 className="doc-h1">Privacy</h1>
        <p className="lede">The short version: no accounts, no analytics, no ads, no tracking. Nothing about you is collected, sold or shared.</p>

        <h2>What stays on your device</h2>
        <p>
          A few settings are saved in your own browser (local storage and two small cookies) so the site remembers what you chose. They never leave your device, except
          the two cookies, which your browser sends back to this site so the page renders in your chosen look. None of them identify you.
        </p>
        <div className="doc-table" tabIndex={0} role="region" aria-label="Settings saved on your device">
          <table>
            <thead>
              <tr>
                <th scope="col">Saved as</th>
                <th scope="col">What it remembers</th>
              </tr>
            </thead>
            <tbody>
              {STORED.map(([key, what]) => (
                <tr key={key}>
                  <td>
                    <code>{key}</code>
                  </td>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>To clear them, clear this site&apos;s data in your browser settings. Everything still works; it just forgets your picks.</p>

        <h2>Hosting</h2>
        <p>
          The site is hosted on Vercel. Like any web host, Vercel handles each request (which includes your IP address and browser details) to deliver the page and
          protect the site from abuse. See <a href="https://vercel.com/legal/privacy-policy">Vercel&apos;s privacy policy</a>. The fonts are served from this site
          itself, so no request goes to Google or any other font service.
        </p>

        <h2>Links to other sites</h2>
        <p>Links to GitHub, npm and others take you to sites with their own privacy policies.</p>

        <h2>Questions</h2>
        <p>
          Open an issue on <a href={`${GITHUB}/issues`}>GitHub</a>. If this page changes, the date below changes with it, and the history is public in the repository.
        </p>
        <p>
          <small>Last updated October 22, 2026.</small>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
