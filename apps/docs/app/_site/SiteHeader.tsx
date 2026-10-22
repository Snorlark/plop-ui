import Link from "next/link";
import { FeedbackToggles } from "./FeedbackToggles";
import { HeaderBar } from "./HeaderBar";
import { MegaNav } from "./MegaNav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The site header on every page: wordmark, mega menus, search (command palette) and haptics/sound toggles. It hides while you scroll down and returns when you scroll up. */
export function SiteHeader() {
  return (
    <HeaderBar>
      <div className="site-header__in">
        <Link href="/" aria-label="PlopUI home" className="site-header__logo logo-sticker">
          <Wordmark size={40} />
        </Link>
        <MegaNav />
        <Search />
        <FeedbackToggles />
      </div>
    </HeaderBar>
  );
}
