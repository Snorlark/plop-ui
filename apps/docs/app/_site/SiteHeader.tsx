import { ButtonLink } from "@plop-ui/react";
import Link from "next/link";
import { FeedbackToggles } from "./FeedbackToggles";
import { HeaderBar } from "./HeaderBar";
import { MegaNav } from "./MegaNav";
import { GITHUB } from "./nav";
import { Search } from "./Search";
import { Wordmark } from "./Wordmark";

/** The repo's star count, refreshed hourly. Null if GitHub is unreachable, and the sticker just says Star. */
async function starCount(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/Snorlark/plop-ui", { next: { revalidate: 3600 } });
    return res.ok ? ((await res.json()) as { stargazers_count: number }).stargazers_count : null;
  } catch {
    return null;
  }
}

/** The site header on every page: wordmark, mega menus, search (command palette), a GitHub star link (1200px and up; on phones it sits in the menu) and haptics/sound toggles. It hides while you scroll down and returns when you scroll up. */
export async function SiteHeader() {
  const stars = await starCount();
  return (
    <HeaderBar>
      <div className="site-header__in">
        <Link href="/" aria-label="PlopUI home" className="site-header__logo logo-sticker">
          <Wordmark size={40} />
        </Link>
        <MegaNav stars={stars} />
        <Search />
        <ButtonLink href={GITHUB} size="sm" variant="plain" tilt={2} burst={false} className="site-header__star" aria-label={stars ? `Star PlopUI on GitHub, ${stars} stars` : "Star PlopUI on GitHub"} iconLeft={<span className="site-header__star-icon" aria-hidden="true">★</span>}>
          {stars ? `Star · ${stars}` : "Star"}
        </ButtonLink>
        <FeedbackToggles />
      </div>
    </HeaderBar>
  );
}
