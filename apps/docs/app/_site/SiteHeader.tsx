import { ButtonLink } from "@plop-ui/react";
import Link from "next/link";
import { FeedbackToggles } from "./FeedbackToggles";
import { HeaderBar } from "./HeaderBar";
import { MegaNav } from "./MegaNav";
import { GITHUB } from "./nav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The site header on every page: wordmark, mega menus, search (command palette), a GitHub star link (1200px and up) and haptics/sound toggles. It hides while you scroll down and returns when you scroll up. */
export function SiteHeader() {
  return (
    <HeaderBar>
      <div className="site-header__in">
        <Link href="/" aria-label="PlopUI home" className="site-header__logo logo-sticker">
          <Wordmark size={40} />
        </Link>
        <MegaNav />
        <Search />
        <ButtonLink href={GITHUB} size="sm" variant="plain" tilt={2} burst={false} className="site-header__star" aria-label="Star PlopUI on GitHub">
          ★ Star
        </ButtonLink>
        <FeedbackToggles />
      </div>
    </HeaderBar>
  );
}
