import { ButtonLink } from "@plop-ui/react";
import Link from "next/link";
import { FeedbackToggles } from "./FeedbackToggles";
import { MainNav } from "./MainNav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The site header on every page: wordmark, main nav, search (command palette), haptics/sound toggles, and "Browse components". */
export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="PlopUI home" className="site-header__logo">
        <Wordmark size={40} />
      </Link>
      <MainNav />
      <Search />
      <FeedbackToggles />
      <ButtonLink as={Link} href="/kit" size="sm" tilt={-2} buddy="peek" className="site-header__cta">
        Browse components
      </ButtonLink>
    </header>
  );
}
