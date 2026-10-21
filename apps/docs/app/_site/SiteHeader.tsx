import Link from "next/link";
import { MainNav } from "./MainNav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The site header: wordmark, main nav, search, and a "Get started" pill. */
export function SiteHeader({ search = true }: { search?: boolean }) {
  return (
    <header className="site-header">
      <Link href="/" aria-label="PlopUI home" className="site-header__logo">
        <Wordmark size={40} />
      </Link>
      <MainNav />
      {search && <Search />}
      <Link href="/docs/getting-started" className="site-pill">
        Get started
      </Link>
    </header>
  );
}
