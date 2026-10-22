import {
  ArrowDownIcon,
  Avatar,
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
import type { ReactNode } from "react";
import { CopyCommand } from "./CopyCommand";
import { Hand, Scribble } from "./Doodles";
import { PaperStack } from "./PaperStack";
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

/** "Press it!" — the handwritten red kicker above section titles. */
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

function PackSticker({
  tilt,
  children,
}: {
  tilt: number;
  children: ReactNode;
}) {
  return (
    <div className="pack-sticker" style={{ transform: `rotate(${tilt}deg)` }}>
      {children}
    </div>
  );
}

function Hero() {
  return (
    <section className="home-hero">
      <div className="home-hero__copy">
        <Kicker>Press it!</Kicker>
        <div className="home-hero__title">
          <HeroTitle />
        </div>
        <p className="home-lede">
          Sticker buttons, washi-tape tags and status timelines for dispatch,
          field service and ticketing. Accessible, server-rendered, and they
          squish.
        </p>
        <div className="home-hero__cta">
          <ButtonLink
            as={Link}
            href="/docs/getting-started"
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

        <div className="pack plop-paper">
          <div className="pack__header" aria-hidden="true">
            <span className="pack__hole" />
          </div>
          <div className="pack__body">
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
            <div className="pack__sheet">
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
                  Send report
                </ButtonLink>
              </PackSticker>
              <PackSticker tilt={-4}>
                <Tag status="critical">Critical</Tag>
              </PackSticker>
              <PackSticker tilt={-8}>
                <Switch defaultChecked aria-label="Sample switch" />
              </PackSticker>
              <PackSticker tilt={6}>
                <IconButton
                  variant="mustard"
                  icon={<PlusIcon />}
                  label="New incident"
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
                    steps={["Called", "Sent", "On scene", "Done"]}
                    current={2}
                    orientation="horizontal"
                    label="Sample incident"
                  />
                </span>
              </PackSticker>
              <PackSticker tilt={-3}>
                <Avatar name="Mika Tan" status="busy" />
              </PackSticker>
              <PackSticker tilt={3}>
                <Toast kind="success">Report sent</Toast>
              </PackSticker>
              <PackSticker tilt={2}>
                <Tag status="en-route">En route</Tag>
              </PackSticker>
              <PackSticker tilt={-5}>
                <span className="pack-chip">
                  <Eta value="6" unit="min" />
                </span>
              </PackSticker>
              <PackSticker tilt={4}>
                <StickyNote tone="pink" tilt={0} className="pack-note">
                  Gate is locked. Use the side door.
                </StickyNote>
              </PackSticker>
              <PackSticker tilt={-12}>
                <Count label="3 new">3</Count>
              </PackSticker>
              <PackSticker tilt={4}>
                <Avatar name="Ana Cruz" status="online" />
              </PackSticker>
            </div>
            <span className="pack__shine" aria-hidden="true" />
          </div>
        </div>
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
    <section className="home-letter">
      <div className="home-letter__head">
        <div className="home-letter__from">
          <Avatar name="Rosa Santos" />
          <Kicker color="var(--plop-ink-soft)">From Lark &lt;3</Kicker>
        </div>
        <h2 className="home-h2 home-letter__title">
          Hey builder!
          <br />
          <span>Your users are having a rough day.</span>
        </h2>
      </div>
      <div className="home-letter__body">
        <p>
          You build software for people on the line: a flooded street, a broken
          printer, a rider who’s late. They tap fast and read faster.
        </p>
        <p>
          So every button should answer when it’s pressed. Every word should
          read on every color. And all of it should load quickly on a cheap
          phone.
        </p>
        <p className="home-letter__sign">
          That’s what PlopUI is for. Hand-drawn on the outside, accessible and
          dependable on the inside.
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
    <section className="home-pieces" id="pieces">
      <div className="home-center home-section-head">
        <Kicker>What’s in the pack</Kicker>
        <h2 className="home-h2">Every piece is a little paper object.</h2>
        <p className="home-sub">
          Polaroids, tickets, notebook pages. Rugged on the outside, readable
          inside.
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
              Send report
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
              Status, as strips of washi tape. Removable ones peel off and fly
              away.
            </p>
            <div className="piece-row">
              <Tag status="critical" tilt={-3}>
                Critical
              </Tag>
              <Tag status="en-route" tilt={2}>
                En route
              </Tag>
              <Tag status="resolved" tilt={-1}>
                Resolved
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
            Reported, dispatched, en route, resolved. The current step boils so
            eyes find it.
          </p>
          <StatusTimeline
            steps={["Reported", "Dispatched", "En route", "Resolved"]}
            current={2}
            orientation="horizontal"
            label="Sample incident"
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
            <Checkbox defaultChecked>Notify responders</Checkbox>
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
    preview: <span className="grid-fake-btn">Send report</span>,
  },
  {
    slug: "tag",
    title: "Tag",
    text: "Status as strips of washi tape. Removable ones peel off and fly away.",
    preview: (
      <>
        <Tag status="critical" tilt={-3}>
          Critical
        </Tag>
        <Tag status="en-route" tilt={2}>
          En route
        </Tag>
        <Tag status="resolved" tilt={-1}>
          Resolved
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
    text: "Reported, dispatched, en route, resolved. The current step boils.",
    preview: (
      <StatusTimeline
        className="grid-timeline"
        steps={["Reported", "Sent", "En route", "Done"]}
        current={2}
        orientation="horizontal"
        label="Sample incident"
      />
    ),
  },
  {
    slug: "callout",
    title: "Callout",
    text: "A strip torn off a pad, for what people must know before they act.",
    preview: (
      <Callout tone="warn" title="Location is approximate" headingLevel={4} />
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
    text: "A ticket stub, a taped unit card and a sticky note.",
    preview: <span className="grid-fake-ticket">Ticket #1042</span>,
  },
  {
    slug: "tabs",
    title: "Tabs",
    text: "Index-card dividers. Arrow keys move between them.",
    preview: (
      <span className="grid-fake-tabs">
        <i>Active</i>
        <i>Resolved</i>
      </span>
    ),
  },
  {
    slug: "progress",
    title: "Progress",
    text: "Filled with crayon hatching; the leading edge is one heavier stroke.",
    preview: <span className="grid-fake-progress" />,
  },
];

function ComponentsGrid() {
  return (
    <section className="home-components" id="components">
      <div className="home-center home-section-head">
        <Kicker>The whole pack</Kicker>
        <h2 className="home-h2">Thirty pieces, one ink.</h2>
        <p className="home-sub">
          Each one a thin hand-drawn layer over an accessible primitive. Try any
          of them in the playground.
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
    <section className="home-surfaces" id="surfaces">
      <div>
        <Kicker>Surfaces</Kicker>
        <h2 className="home-h2">Five papers, one ink.</h2>
        <p className="home-sub">
          Pick the paper your app sits on. Stickers stay the same; text colors
          adjust so everything stays readable, in light and dark.
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
            {"\n        "}Send report{"\n      "}&lt;/Button&gt;{"\n    "}
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
