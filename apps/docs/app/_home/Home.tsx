import {
  ArrowDownIcon,
  Avatar,
  Skeleton,
  SpinnerMark,
  AvatarStack,
  ButtonLink,
  Callout,
  Checkbox,
  contrastRatio,
  Count,
  Eta,
  IconButton,
  PlusIcon,
  StatusTimeline,
  StickyNote,
  Switch,
  Tag,
  Toast,
} from "@plop-ui/react";
import { color, surfaceNames, surfaces } from "@plop-ui/tokens";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CopyCommand } from "./CopyCommand";
import { Hand, Scribble, Tape } from "./Doodles";
import { PaperStack } from "./PaperStack";
import { PackSticker, StickerPack } from "./StickerPack";
import { WhyPlop } from "./WhyPlop";
import { HeroTitle } from "./HeroTitle";

const CROWD_NAMES = [
  "Mara Dela Cruz",
  "Hannah Co",
  "Lia Torres",
  "Kiko Bautista",
  "Joy Mendoza",
  "Sol Javier",
  "Migs Aquino",
  "Ivy Navarro",
  "Andi Flores",
  "Rina Uy",
  "Noel Bernal",
  "Pat Santiago",
  "Celine Tan",
  "Tala Ramos",
  "Rosa Santos",
  "Tess Mercado",
  "Pia Santos",
  "Bea Soriano",
  "Maya Cortez",
  "Enzo Lopez",
  "Dom Salazar",
  "Luis Ong",
  "Gab Reyes",
  "Jun Reyes",
  "Fritz Manalo",
  "Raf Castillo",
  "Elle Garcia",
  "Nico Valdez",
  "Olive Yap",
  "Gelo Pascual",
  "Jessa Lim",
  "Leo Garcia",
  "Mika Tan",
  "Dante Uy",
  "Iggy Sison",
  "Quinn Ramos",
  "Sam Villanueva",
  "Carla Dizon",
  "Kat Robles",
  "Ana Cruz",
  "Ben Ocampo",
  "Bong Ramos",
  "Paolo Lim",
  "Toto Cruz",
];

/** Three rows wide enough to run edge to edge on a big screen (with room to drift); each row starts at a different name. */
const CROWD: string[][] = [0, 17, 31].map((offset) =>
  Array.from(
    { length: 44 },
    (_, i) => CROWD_NAMES[(offset + i) % CROWD_NAMES.length] as string,
  ),
);

/** The handwritten red kicker, now only for the letter's "From Lark". Section labels use <Tape>. */
function Kicker({
  children,
  color: c = "var(--plop-tomato)",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span className="home-kicker" style={{ color: c }}>
      {children}
      <Scribble color={c} />
    </span>
  );
}

function Hero() {
  return (
    <section data-pausable className="home-hero">
      <div className="home-hero__copy">
        <Tape tone="mustard" tilt={-4}>Press it!</Tape>
        <div className="home-hero__title">
          <HeroTitle />
        </div>
        <p className="home-lede">
          Wobbly lines, colors by instinct. It breaks the design rulebook,
          never the accessibility one.
        </p>
        <div className="home-hero__cta">
          <ButtonLink
            as={Link}
            href="/docs/what-is-plopui"
            size="lg"
            tilt={-2}
            buddy="peek"
          >
            Get started
          </ButtonLink>
          <CopyCommand />
        </div>
      </div>

      <div className="home-stage">
        <div
          className="home-crowd"
          aria-hidden="true"
          data-plop-motion="reduce"
        >
          {CROWD.map((row, r) => (
            <div className="home-crowd__row" key={r}>
              {row.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="home-crowd__face"
                  style={{
                    transform: `translateY(${((i * 7 + r * 5) % 13) - 6}px)`,
                    ["--col" as string]: i + r * 2,
                  }}
                >
                  <Avatar
                    name={name}
                    size={i % 3 === 0 ? "xl" : "lg"}
                    tilt={((i * 5 + r * 3) % 11) - 5}
                  />
                </span>
              ))}
            </div>
          ))}
          <span className="home-crowd__hand home-crowd__hand--l">
            <Hand />
          </span>
          <span className="home-crowd__hand home-crowd__hand--r">
            <Hand />
          </span>
        </div>

        <StickerPack
          cover={
            <div className="pack__cover">
              <span className="pack__cover-blobs" aria-hidden="true" />
              <Tag tone="mustard" tilt={-2}>
                PlopUI themed
              </Tag>
              <span className="pack__title">Sticker Pack</span>
              <span className="pack__meta">
                Real components / Hand-drawn / Open source
              </span>
            </div>
          }
        >
              <PackSticker tilt={-6}>
                <Avatar name="Rosa Santos" status="online" size="lg" />
              </PackSticker>
              <PackSticker tilt={3}>
                <ButtonLink
                  as={Link}
                  href="/docs/components/button"
                  size="sm"
                  seed="pack-send"
                >
                  Post sketch
                </ButtonLink>
              </PackSticker>
              <PackSticker tilt={-4}>
                <Tag tone="tomato">Wild idea</Tag>
              </PackSticker>
              <PackSticker tilt={-8}>
                <Switch defaultChecked aria-label="Sample switch" />
              </PackSticker>
              <PackSticker tilt={6}>
                <IconButton
                  variant="mustard"
                  icon={<PlusIcon />}
                  label="New sketch"
                />
              </PackSticker>
              <PackSticker tilt={5}>
                <Avatar name="Jun Reyes" />
              </PackSticker>
              <PackSticker tilt={2}>
                <span className="pack-chip">
                  <Checkbox defaultChecked>Notify</Checkbox>
                </span>
              </PackSticker>
              <PackSticker tilt={-2}>
                <span className="pack-chip pack-chip--wide">
                  <StatusTimeline
                    className="pack-timeline"
                    steps={["Sketched", "Inked", "Colored", "Shipped"]}
                    current={2}
                    orientation="horizontal"
                    label="Sample sketch"
                  />
                </span>
              </PackSticker>
              <PackSticker tilt={-3}>
                <Avatar name="Mika Tan" status="busy" />
              </PackSticker>
              <PackSticker tilt={3}>
                <Toast kind="success">Sketch posted</Toast>
              </PackSticker>
              <PackSticker tilt={2}>
                <Tag tone="mustard">In progress</Tag>
              </PackSticker>
              <PackSticker tilt={-5}>
                <span className="pack-chip">
                  <Eta value="6" unit="min left" />
                </span>
              </PackSticker>
              <PackSticker tilt={4}>
                <StickyNote tone="pink" tilt={0} className="pack-note">
                  Try the mint. It’s louder, in a good way.
                </StickyNote>
              </PackSticker>
              <PackSticker tilt={-12}>
                <Count label="3 new">3</Count>
              </PackSticker>
              <PackSticker tilt={4}>
                <Avatar name="Ana Cruz" status="online" />
              </PackSticker>
        </StickerPack>
        <Link
          href="#pieces"
          className="home-down"
          aria-label="See what's in the pack"
        >
          <ArrowDownIcon size={28} />
        </Link>
      </div>
    </section>
  );
}

function Letter() {
  return (
    <section data-pausable className="home-letter">
      <div className="home-letter__head">
        <div className="home-letter__from">
          <Avatar name="Lark Babao" />
          <Kicker color="var(--plop-ink-soft)">From Lark &lt;3</Kicker>
        </div>
        <h2 className="home-h2 home-letter__title">
          Hey builder!
          <br />
          <span>Who said UI has to be perfect?</span>
        </h2>
      </div>
      <div className="home-letter__body">
        <p>
          Most interfaces look the same now: the same grid, the same radius,
          the same safe palette. Clean, correct and forgettable.
        </p>
        <p>
          PlopUI goes the other way. Lines wobble, stickers sit a little
          crooked, and the colors come from instinct, not strategy. Every
          imperfection is on purpose, an experiment rather than a rule.
        </p>
        <p>
          Break the visual rulebook all you like. The rules that keep the door
          open, like contrast, keyboard and screen readers, stay put. They’re
          what lets everyone join the fun.
        </p>
        <p className="home-letter__sign">
          Creativity is the brain having fun. This kit is mine. Go make it
          yours.
        </p>
      </div>
    </section>
  );
}

const RECEIPT: Array<[string, string, string]> = [
  ["Ink", color.onInk, color.ink],
  ["Tomato", color.onInk, color.tomato],
  ["Periwinkle", color.inkText, color.periwinkle],
  ["Mint", color.inkText, color.mint],
  ["Mustard", color.inkText, color.mustard],
  ["Paper", color.ink, color.paper],
];

function Pieces() {
  const ratios = RECEIPT.map(
    ([name, fg, bg]) => [name, contrastRatio(fg, bg)] as const,
  );
  const failures = ratios.filter(([, r]) => r < 4.5).length;
  return (
    <section data-pausable className="home-pieces" id="pieces">
      <div className="home-center home-section-head">
        <Tape tone="periwinkle" tilt={2}>What’s in the pack</Tape>
        <h2 className="home-h2">
          Made of paper.
          <br />
          <span>Built like software.</span>
        </h2>
        <p className="home-sub">
          Polaroids, tickets and notebook pages, each one a real component.
        </p>
      </div>
      <div className="pieces">
        <figure
          className="piece-polaroid"
          style={{ transform: "rotate(-2deg)" }}
        >
          <span
            className="piece-tape"
            style={{
              ["--tape" as string]: "var(--plop-periwinkle)",
              transform: "rotate(-5deg)",
            }}
            aria-hidden="true"
          />
          <div
            className="piece-polaroid__photo"
            style={{
              background:
                "color-mix(in srgb, var(--plop-periwinkle) 20%, white)",
            }}
          >
            <ButtonLink
              as={Link}
              href="/docs/components/button"
              tilt={-3}
              seed="piece-send"
            >
              Post sketch
            </ButtonLink>
          </div>
          <figcaption>
            <span className="piece-title">Button</span>
            <span>Squishes when you press it.</span>
          </figcaption>
        </figure>

        <article className="piece-ticket">
          <div className="piece-ticket__main">
            <span className="piece-small">Piece no. 02</span>
            <h3 className="piece-title">Tag</h3>
            <p>
              Labels, as strips of washi tape. Removable ones peel off and fly
              away.
            </p>
            <div className="piece-row">
              <Tag tone="tomato" tilt={-3}>
                Wild idea
              </Tag>
              <Tag tone="mustard" tilt={2}>
                In progress
              </Tag>
              <Tag tone="mint" tilt={-1}>
                Shipped
              </Tag>
            </div>
          </div>
          <div className="piece-ticket__stub">
            <span>Admit one</span>
          </div>
        </article>

        <article className="piece-notebook">
          <span className="piece-notebook__holes" aria-hidden="true" />
          <h3 className="piece-title">Status timeline</h3>
          <p>
            Sketched, inked, colored, shipped. The current step boils so eyes
            find it.
          </p>
          <StatusTimeline
            steps={["Sketched", "Inked", "Colored", "Shipped"]}
            current={2}
            orientation="horizontal"
            label="Sample sketch"
          />
        </article>

        <article className="piece-note">
          <span
            className="piece-tape"
            style={{
              ["--tape" as string]: "var(--plop-mustard)",
              transform: "rotate(4deg)",
            }}
            aria-hidden="true"
          />
          <h3 className="piece-title">Switch &amp; checkbox</h3>
          <p>
            The switch knob sleeps when off and wakes up when on. Ticks are
            drawn in one stroke.
          </p>
          <div className="piece-row">
            <Switch aria-label="Try the switch (off)" />
            <Switch defaultChecked aria-label="Try the switch (on)" />
            <Checkbox defaultChecked>Notify my friends</Checkbox>
          </div>
        </article>

        <figure
          className="piece-polaroid"
          style={{ transform: "rotate(2deg)" }}
        >
          <span
            className="piece-tape"
            style={{
              ["--tape" as string]: "var(--plop-bubblegum)",
              transform: "rotate(6deg)",
            }}
            aria-hidden="true"
          />
          <div
            className="piece-polaroid__photo"
            style={{
              background:
                "color-mix(in srgb, var(--plop-bubblegum) 18%, white)",
            }}
          >
            <AvatarStack
              names={[
                "Rosa Santos",
                "Gab Reyes",
                "Mara Dela Cruz",
                "Enzo Lopez",
              ]}
              max={4}
            />
          </div>
          <figcaption>
            <span className="piece-title">Avatar</span>
            <span>Drawn from a name. Rosa always looks like Rosa.</span>
          </figcaption>
        </figure>

        <article className="piece-receipt" aria-label="Contrast receipt">
          <div className="piece-receipt__title">Contrast receipt</div>
          <div className="piece-receipt__sub">EVERY FILL / ITS TEXT</div>
          <hr />
          <ul>
            {ratios.map(([name, r]) => (
              <li key={name}>
                <span>{name}</span>
                <span className="piece-receipt__dots" aria-hidden="true" />
                <span>{r.toFixed(1)}:1</span>
              </li>
            ))}
          </ul>
          <hr />
          <div className="piece-receipt__total">
            <span>Total failures</span>
            <span>{failures}</span>
          </div>
          <div className="piece-receipt__thanks">
            Thank you for reading every word.
          </div>
        </article>
      </div>
    </section>
  );
}

const GRID: Array<{
  slug: string;
  title: string;
  text: string;
  preview: ReactNode;
}> = [
  {
    slug: "button",
    title: "Button",
    text: "Six colors, three sizes, loading, and a buddy for the one action that matters.",
    preview: <span className="grid-fake-btn">Post sketch</span>,
  },
  {
    slug: "tag",
    title: "Tag",
    text: "Labels as strips of washi tape. Removable ones peel off and fly away.",
    preview: (
      <>
        <Tag tone="tomato" tilt={-3}>
          Wild idea
        </Tag>
        <Tag tone="mustard" tilt={2}>
          In progress
        </Tag>
        <Tag tone="mint" tilt={-1}>
          Shipped
        </Tag>
      </>
    ),
  },
  {
    slug: "switch",
    title: "Switch",
    text: "The knob is a face that sleeps when off and wakes up when you flip it on.",
    preview: (
      <>
        <span className="fake-switch" />
        <span className="fake-switch fake-switch--on" />
      </>
    ),
  },
  {
    slug: "status-timeline",
    title: "Status timeline",
    text: "Sketched, inked, colored, shipped. The current step boils.",
    preview: (
      <StatusTimeline
        className="grid-timeline"
        steps={["Sketched", "Inked", "Colored", "Shipped"]}
        current={2}
        orientation="horizontal"
        label="Sample sketch"
      />
    ),
  },
  {
    slug: "callout",
    title: "Callout",
    text: "A strip torn off a pad, for what people must know before they act.",
    preview: (
      <Callout tone="warn" title="Not saved yet" headingLevel={4} />
    ),
  },
  {
    slug: "avatar",
    title: "Avatar",
    text: "Doodle faces drawn from a name, so the same person always gets the same face.",
    preview: (
      <AvatarStack
        names={["Rosa Santos", "Jun Reyes", "Mika Tan", "A", "B", "C", "D"]}
      />
    ),
  },
  {
    slug: "cards",
    title: "Cards",
    text: "A ticket stub, a taped card and a sticky note.",
    preview: <span className="grid-fake-ticket">Sketch #1042</span>,
  },
  {
    slug: "tabs",
    title: "Tabs",
    text: "Index-card dividers. Arrow keys move between them.",
    preview: (
      <span className="grid-fake-tabs">
        <i>Drafts</i>
        <i>Shipped</i>
      </span>
    ),
  },
  {
    slug: "loading#progress",
    title: "Progress",
    text: "Filled with crayon hatching; the leading edge is one heavier stroke.",
    preview: <span className="grid-fake-progress" />,
  },
  {
    slug: "loading#spinners",
    title: "Spinner",
    text: "A marker loop that never closes neatly, hopping dots, a coin-flip sticker. Waits with manners.",
    preview: (
      <span style={{ display: "inline-flex", gap: 22, alignItems: "center", color: "var(--plop-ink)" }}>
        <SpinnerMark style={{ "--sp-size": "38px" } as CSSProperties} seed="home-ink" />
        <SpinnerMark kind="sticker" style={{ "--sp-size": "38px" } as CSSProperties} seed="home-star" />
      </span>
    ),
  },
  {
    slug: "loading#skeletons",
    title: "Skeleton",
    text: "Hand-cut paper scraps that hold the place of what's loading.",
    preview: (
      <span style={{ display: "flex", gap: 12, alignItems: "center", width: "80%" }}>
        <Skeleton shape="circle" width={40} height={40} seed="home-a" />
        <span style={{ flex: 1, display: "grid", gap: 8 }}>
          <Skeleton height={12} width="90%" seed="home-1" />
          <Skeleton height={12} width="60%" seed="home-2" />
        </span>
      </span>
    ),
  },
];

function ComponentsGrid() {
  return (
    <section data-pausable className="home-components" id="components">
      <div className="home-center home-section-head">
        <Tape tone="mint" tilt={-2}>The whole pack</Tape>
        <h2 className="home-h2">
          Thirty pieces.
          <br />
          <span>Zero rulers.</span>
        </h2>
        <p className="home-sub">
          Drawn freehand over accessible elements. Try any of them in the
          playground.
        </p>
      </div>
      <div className="grid-cards">
        {GRID.map((g) => (
          <Link
            key={g.slug}
            href={`/docs/components/${g.slug}`}
            className="grid-card"
          >
            <div className="grid-card__preview" aria-hidden="true">
              {g.preview}
            </div>
            <div className="grid-card__text">
              <span className="grid-card__title">{g.title}</span>
              <span>{g.text}</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="home-center" style={{ marginTop: 40 }}>
        <ButtonLink as={Link} href="/playground" variant="mustard" tilt={-2}>
          Open the playground
        </ButtonLink>
      </div>
    </section>
  );
}

const CHIP_BG: Record<string, string> = {
  poster: "radial-gradient(rgba(40,72,216,.3) 1px, transparent 1.4px) 0 0 / 6px 6px, #EEE7D6",
  mat: "linear-gradient(rgba(255,248,231,.35) 1.5px, transparent 1.5px) 0 0 / 10px 10px, linear-gradient(90deg, rgba(255,248,231,.35) 1.5px, transparent 1.5px) 0 0 / 10px 10px, #2E6B55",
  notebook: "linear-gradient(90deg, transparent 8px, #E79C9C 8px 10px, transparent 10px), repeating-linear-gradient(#F8F4E9 0 6px, #BFCDF0 6px 7px)",
  kraft: "radial-gradient(rgba(90,60,30,.35) 1px, transparent 1.4px) 0 0 / 5px 5px, #C69C6D",
  riso: "radial-gradient(rgba(210,56,30,.4) 1.4px, transparent 1.8px) 0 0 / 6px 6px, #F6A9B8",
};

function Surfaces() {
  return (
    <section data-pausable className="home-surfaces" id="surfaces">
      <div>
        <Tape tone="bubblegum" tilt={3}>Surfaces</Tape>
        <h2 className="home-h2">
          Five papers.
          <br />
          <span>Same wobble.</span>
        </h2>
        <p className="home-sub">
          Pick the paper your app sits on. Text colors adjust so it all stays
          readable, light or dark.
        </p>
        <ul className="home-surfaces__chips">
          {surfaceNames.map((s) => (
            <li key={s}>
              <Link href={`/playground?surface=${s}`}>
                <span
                  className="home-surfaces__chip"
                  style={{ background: CHIP_BG[s] }}
                  aria-hidden="true"
                />
                {surfaces[s].label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <figure className="home-code">
        <figcaption>app/page.tsx</figcaption>
        <pre tabIndex={0}>
          <code>
            <span className="tk-k">import</span> {"{ PlopProvider, Button }"}{" "}
            <span className="tk-k">from</span>{" "}
            <span className="tk-s">&quot;@plop-ui/react&quot;</span>;{"\n\n"}
            <span className="tk-k">export default function</span> Page() {"{"}
            {"\n  "}
            <span className="tk-k">return</span> ({"\n    "}&lt;PlopProvider
            surface=<span className="tk-s">&quot;poster&quot;</span>&gt;
            {"\n      "}&lt;Button variant=
            <span className="tk-s">&quot;tomato&quot;</span> buddy&gt;
            {"\n        "}Post sketch{"\n      "}&lt;/Button&gt;{"\n    "}
            &lt;/PlopProvider&gt;{"\n  "});{"\n"}
            {"}"}
          </code>
        </pre>
      </figure>
    </section>
  );
}

export function Home() {
  return (
    <main id="main">
      {/* Drift: as the hero scrolls away its crowd rows slide apart sideways and the letter rises in (site.css). */}
      <div className="home-flow">
        <div className="home-top">
          <Hero />
        </div>
        <div className="home-next">
          <Letter />
        </div>
      </div>
      <WhyPlop />
      <Pieces />
      <ComponentsGrid />
      <PaperStack />
      <Surfaces />
    </main>
  );
}
