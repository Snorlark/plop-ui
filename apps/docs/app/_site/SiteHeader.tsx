import Link from "next/link";
import { FeedbackToggles } from "./FeedbackToggles";
import { MainNav } from "./MainNav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The site header on every page: wordmark, main nav, search (command palette) and haptics/sound toggles. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="PlopUI home" className="site-header__logo">
        <Wordmark size={40} />
      </Link>
      <MainNav />
      <Search />
      <FeedbackToggles />
    </header>
  );
}
