
import { Avatar, AvatarSymbol } from "@plop-ui/react";
import { Hand } from "./Doodles";

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

/**
 * Three rows wide enough to run edge to edge on a big screen (with room to drift); each row starts at a
 * different name. 38 a row: the CSS hides anything past that below 1100px anyway.
 */
const CROWD: string[][] = [0, 17, 31].map((offset) =>
  Array.from(
    { length: 38 },
    (_, i) => CROWD_NAMES[(offset + i) % CROWD_NAMES.length] as string,
  ),
);

/**
 * The hero's crowd of faces, decorative. Each face is drawn once as an AvatarSymbol and reused with <use>,
 * so ~110 faces cost a few hundred elements instead of ~2,000 (#67). It stays a Server Component: as a
 * client component it saved bytes but cost more in hydration (measured).
 */
export function Crowd() {
  return (
    <div
      className="home-crowd"
      aria-hidden="true"
      data-plop-motion="reduce"
    >
      {/* Each face is drawn once here and reused below with <use>: a crowd of ~110 faces stays a few hundred elements. */}
      <svg className="home-crowd__sprite" aria-hidden="true" focusable="false">
        {CROWD_NAMES.map((name, i) => (
          <AvatarSymbol key={name} name={name} id={`crowd-face-${i}`} />
        ))}
      </svg>
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
                faceHref={`#crowd-face-${CROWD_NAMES.indexOf(name)}`}
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
  );
}
