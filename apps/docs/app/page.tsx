import { Home } from "./_home/Home";
import { SiteFooter } from "./_site/SiteFooter";
import { SiteHeader } from "./_site/SiteHeader";

export default function HomePage() {
  return (
    <div className="site site--home">
      <SiteHeader search={false} />
      <Home />
      <SiteFooter />
    </div>
  );
}
