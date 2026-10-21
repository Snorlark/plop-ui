/**
 * The prototype's hero poster: a little character pulling a giant star
 * sticker off the poster, lettered "Press it like you mean it".
 * Docs-site art, not part of the library.
 */
export function PosterArt() {
  return (
    <figure className="poster" aria-label="Illustration: a little character pulling a giant star sticker off the poster, lettered Press it like you mean it">
      <p className="poster__type" aria-hidden="true">
        <span>Press it</span>
        <br />
        <span>like you</span>
        <br />
        <span>mean it</span>
      </p>
      <svg className="peelart" viewBox="4 58 292 244" aria-hidden="true">
        <g className="ground">
          <path d="M14 278 C 50 276, 92 280, 132 277" />
          <path d="M156 279 C 196 277, 242 281, 288 278" />
          <path d="M40 294 C 62 293, 86 295, 108 293" />
          <path d="M180 295 C 204 294, 230 296, 254 294" />
        </g>
        <g className="sticker">
          <path className="spot solid" style={{ fill: "var(--plop-mustard)" }} d="M206 106 C 246 105, 277 137, 276 177 C 275 217, 245 247, 205 246 C 165 245, 136 215, 137 175 C 138 151, 149 129, 167 117 Z" transform="translate(4 3)" />
          <path className="ln" d="M206 106 C 246 105, 277 137, 276 177 C 275 217, 245 247, 205 246 C 165 245, 136 215, 137 175 C 138 151, 149 129, 167 117 Z" />
          <path className="spot solid" style={{ fill: "var(--plop-tomato)" }} d="M216 148 L 225 170 L 249 172 L 230 186 L 237 210 L 216 196 L 195 210 L 202 186 L 183 172 L 207 170 Z" transform="translate(3 2)" />
          <path className="ln thin" d="M216 148 L 225 170 L 249 172 L 230 186 L 237 210 L 216 196 L 195 210 L 202 186 L 183 172 L 207 170 Z" />
          <path className="gap" d="M147 146 C 146 128, 166 108, 194 106 L 196 104 C 170 98, 140 118, 139 150 Z" />
          <path className="ln thin dash" d="M150 146 C 162 128, 176 114, 196 107" />
        </g>
        <g className="flap">
          <path className="ln fillp" d="M150 146 C 140 132, 130 118, 118 104 C 138 96, 170 98, 196 107 C 178 114, 162 128, 150 146 Z" />
          <path className="ln thin" d="M136 116 C 146 112, 160 112, 172 108" />
        </g>
        <g className="tug">
          <path className="ln" d="M56 198 C 50 222, 44 240, 38 260" />
          <path className="spot solid" style={{ fill: "var(--plop-tomato)" }} d="M40 256 C 28 252, 14 258, 16 268 C 26 272, 42 268, 44 260 Z" transform="translate(2 2)" />
          <path className="ln" d="M40 256 C 28 252, 14 258, 16 268 C 26 272, 42 268, 44 260 Z" />
          <path className="ln" d="M80 198 C 92 220, 102 238, 110 256" />
          <path className="spot solid" style={{ fill: "var(--plop-tomato)" }} d="M106 254 C 116 248, 134 252, 134 262 C 126 268, 110 266, 104 260 Z" transform="translate(2 2)" />
          <path className="ln" d="M106 254 C 116 248, 134 252, 134 262 C 126 268, 110 266, 104 260 Z" />
          <path className="spot solid" style={{ fill: "var(--plop-periwinkle)" }} d="M58 140 C 74 132, 92 136, 100 144 L 90 198 C 76 204, 58 202, 48 196 Z" transform="translate(3 3)" />
          <path className="ln" d="M58 140 C 74 132, 92 136, 100 144 L 90 198 C 76 204, 58 202, 48 196 Z" />
          <path className="ln" d="M86 152 C 100 140, 110 124, 116 110" />
          <path className="ln" d="M94 146 C 106 134, 116 122, 124 112" />
          <path className="ln fillp" d="M112 110 C 108 100, 120 94, 126 102 C 130 110, 118 116, 112 110 Z" />
          <g className="head">
            <path className="ln fillp" d="M34 112 C 32 88, 48 76, 64 77 C 82 78, 92 92, 90 112 C 89 130, 76 140, 62 140 C 46 140, 35 128, 34 112 Z" />
            <path className="ln thin" d="M60 77 C 58 66, 68 62, 70 70" />
            <path className="spot" style={{ fill: "var(--plop-bubblegum)" }} d="M38 120 C 38 114, 50 114, 50 120 C 50 126, 38 126, 38 120 Z" />
            <path className="spot" style={{ fill: "var(--plop-bubblegum)" }} d="M76 118 C 76 112, 88 112, 88 118 C 88 124, 76 124, 76 118 Z" />
            <path className="ln thin" d="M48 100 L 56 104 L 48 108" />
            <path className="ln thin" d="M80 98 L 72 102 L 80 106" />
            <path className="ln thin fillp" d="M54 118 C 60 116, 70 116, 76 118 C 76 126, 56 127, 54 118 Z" />
            <path className="ln hair" d="M61 118 L 61 124 M68 117 L 68 124" />
          </g>
        </g>
        <g className="effort">
          <path className="ln thin" d="M22 92 C 18 98, 22 104, 26 100 C 28 96, 24 92, 22 92 Z" />
          <path className="ln thin" d="M30 74 C 27 79, 30 83, 33 80 C 35 77, 32 74, 30 74 Z" />
          <path className="ln thin" d="M128 86 l 6 -8 M140 90 l 9 -5 M118 82 l 1 -10" />
        </g>
      </svg>
    </figure>
  );
}
