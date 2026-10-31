"use client";

import {
  type AnchorHTMLAttributes,
  type ElementType,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import type { BuddyMood } from "../Buddy/Buddy.js";
import { InkMark } from "../Spinner/ink.js";
import { useHaptics } from "../hooks/useHaptics.js";
import { BURST_COLORS, BURST_PRESETS, isFailBurst, type BurstStyle } from "../InkBurst/burstStyles.js";
import { preloadInkBurst, useInkBurst } from "../InkBurst/useInkBurst.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import { useSound } from "../hooks/useSound.js";
import { seededTilt, type Seed } from "../seed.js";
import { cx } from "./cx.js";
import styles from "./Sticker.module.css";
import { useSeed } from "./useSeed.js";

export type StickerVariant = "ink" | "periwinkle" | "mint" | "tomato" | "mustard" | "plain";
export type StickerSize = "sm" | "md" | "lg";

const variantClass: Record<StickerVariant, string | undefined> = {
  ink: styles.inkFill,
  periwinkle: styles.periwinkle,
  mint: styles.mint,
  tomato: styles.tomato,
  mustard: styles.mustard,
  plain: styles.plain,
};

export interface StickerOwnProps {
  /** Spot color printed under the ink. Default `ink`. */
  variant?: StickerVariant;
  /** Sticker size: `sm` for dense rows, `lg` for the one hero action. Default `md`. */
  size?: StickerSize;
  /** Rotation in degrees. Defaults to a small seeded tilt; pass `0` to sit straight. */
  tilt?: number;
  /** Seeds the default tilt so it never changes between renders. Defaults to React's useId(). */
  seed?: Seed;
  /** Shows a busy state, sets `aria-busy` and ignores clicks. */
  loading?: boolean;
  /** Screen reader text while loading. Default "Loading". */
  loadingLabel?: string;
  /**
   * What flies out on click. Off by default: turn it on for the presses worth celebrating (or regretting).
   * `true` picks for the variant: `"confetti"` for most, a `"poof"` of dust for `tomato` (cancel/delete).
   * Or name a style: `"confetti"`, `"stars"`, `"sparkle"`, `"hearts"` to celebrate; `"poof"`, `"zap"`,
   * `"drops"` when something went wrong (those also shake the sticker). Or pass your own colors for
   * confetti. Skipped under reduced motion.
   */
  burst?: boolean | BurstStyle | readonly string[];
  /**
   * The shadow under the sticker: `soft` (a flat, quiet offset), `solid` (ink), `stripes` (crayon hatching),
   * `outline` or `none`. Defaults to PlopProvider's `stickerShadow`, which defaults to `soft`.
   */
  shadow?: StickerShadow;
}

export type StickerShadow = "soft" | "solid" | "stripes" | "outline" | "none";

/** A sticker that bursts fetches the burst drawings while the page is idle, so its first press isn't late. */
function useBurstPreload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const ric = typeof window.requestIdleCallback === "function";
    const id = ric ? window.requestIdleCallback(() => void preloadInkBurst()) : window.setTimeout(() => void preloadInkBurst(), 200);
    return () => (ric ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, [enabled]);
}

/** Resolves the `burst` prop to what actually flies out. */
function burstFor(burst: StickerOwnProps["burst"], variant: StickerVariant): { colors: readonly string[]; style: BurstStyle } | null {
  if (!burst) return null;
  if (Array.isArray(burst)) return { colors: burst, style: "confetti" };
  const style: BurstStyle = burst === true ? (variant === "tomato" ? "poof" : "confetti") : (burst as BurstStyle);
  if (style === "confetti") return { colors: BURST_COLORS[variant === "tomato" ? "all" : variant], style };
  return { colors: BURST_PRESETS[style], style };
}

interface StickerProps extends StickerOwnProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  ref?: Ref<HTMLButtonElement>;
  round?: boolean;
  buddy?: boolean | "peek";
  /** Which character the buddy is. Default `success` (Pip); e.g. `error` puts Bix on a Retry button. */
  buddyMood?: BuddyMood;
  children: ReactNode;
}

const RELEASE_MS = 420;
const HAPPY_MS = 1100;
const SHAKE_MS = 420;

export function Sticker({
  ref,
  variant = "ink",
  size = "md",
  tilt,
  seed,
  loading = false,
  loadingLabel = "Loading",
  burst = false,
  round = false,
  buddy = false,
  buddyMood = "success",
  shadow,
  disabled,
  type = "button",
  className,
  style,
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...rest
}: StickerProps) {
  const autoSeed = useSeed(seed);
  const angle = tilt ?? seededTilt(autoSeed);
  const haptics = useHaptics();
  const sound = useSound();
  const reduced = useReducedMotion();
  const inkBurst = useInkBurst();
  useBurstPreload(!!burst);
  const [pressed, setPressed] = useState(false);
  const [released, setReleased] = useState(false);
  const [happy, setHappy] = useState(false);
  const [shake, setShake] = useState(false);
  const pressedRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const inert = disabled || loading;

  const press = useCallback(() => {
    if (inert || pressedRef.current) return;
    pressedRef.current = true;
    setPressed(true);
    setReleased(false);
    setHappy(false);
    haptics.tap();
    sound("down");
  }, [inert, haptics, sound]);

  const release = useCallback(() => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    setPressed(false);
    sound("up");
    if (!reduced) {
      setReleased(true);
      later(() => setReleased(false), RELEASE_MS);
    }
  }, [sound, reduced]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    const b = burstFor(burst, variant);
    if (b) {
      inkBurst(event.currentTarget, b.colors, round ? 7 : 9, b.style);
      if (isFailBurst(b.style) && !reduced) {
        setShake(true);
        later(() => setShake(false), SHAKE_MS);
      }
    }
    if (buddy) {
      setHappy(true);
      later(() => setHappy(false), HAPPY_MS);
    }
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      press();
      // Enter fires the click on keydown and has no matching keyup to wait for.
      if (event.key === "Enter") later(release, 110);
    }
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyUp?.(event);
    if (event.key === " ") release();
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (event.button === 0) press();
  };

  const releaseOn =
    (handler?: (event: PointerEvent<HTMLButtonElement>) => void) => (event: PointerEvent<HTMLButtonElement>) => {
      handler?.(event);
      release();
    };

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-pressed={pressed ? "" : undefined}
      data-released={released ? "" : undefined}
      data-happy={happy ? "" : undefined}
      data-shake={shake ? "" : undefined}
      className={cx(styles.root, variantClass[variant], size !== "md" && styles[size], round && styles.round, buddy === "peek" && styles.peek, className)}
      data-shadow={shadow}
      style={{ "--tilt": `${angle}deg`, ...style } as CSSProperties}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={releaseOn(onPointerUp)}
      onPointerLeave={releaseOn(onPointerLeave)}
      onPointerCancel={releaseOn(onPointerCancel)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={(event) => {
        onBlur?.(event);
        // The haptics switch takes focus for a moment and hands it back; that isn't letting go.
        if ((event.relatedTarget as HTMLElement | null)?.hasAttribute?.("data-plop-haptic")) return;
        release();
      }}
    >
      <StickerInner buddy={buddy} buddyMood={buddyMood} loading={loading} loadingLabel={loadingLabel}>
        {children}
      </StickerInner>
    </button>
  );
}


/**
 * The other characters for `buddyMood`. Pip (the default) is drawn right here in BuddyHead; the rest of the
 * cast loads only when a sticker asks for one, so a plain Button doesn't ship six drawings (#67).
 */
const BuddyArt = lazy(() => import("../Buddy/Buddy.js").then((m) => ({ default: m.BuddyArt })));

function StickerInner({ buddy, buddyMood, loading, loadingLabel, children }: { buddy: boolean | "peek"; buddyMood: BuddyMood; loading: boolean; loadingLabel: string; children: ReactNode }) {
  return (
    <>
      <span className={styles.shadow} aria-hidden="true" />
      {buddy &&
        (buddyMood === "success" ? (
          <BuddyHead />
        ) : (
          <span className={cx(styles.buddyHead, styles.buddyCast)} aria-hidden="true">
            <Suspense fallback={null}>
              <BuddyArt mood={buddyMood} />
            </Suspense>
          </span>
        ))}
      <span className={styles.paper}>
        <span className={styles.face}>
          <span className={styles.fill} />
          <span className={styles.ink} />
          <span className={styles.label}>
            <span className={cx(styles.content, loading && styles.hidden)}>{children}</span>
            {loading && (
              <span className={styles.loading}>
                <InkMark style={{ "--sp-size": "1.5em" } as CSSProperties} />
                <span style={visuallyHidden}>{loadingLabel}</span>
              </span>
            )}
          </span>
        </span>
      </span>
      <span className={styles.fold} aria-hidden="true" />
      {buddy && <BuddyHands />}
      <span className={styles.cut} aria-hidden="true" />
    </>
  );
}

interface StickerLinkProps extends Omit<StickerOwnProps, "loading" | "loadingLabel">, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  ref?: Ref<HTMLAnchorElement>;
  href: string;
  /** Render with your router's link component, e.g. Next.js `Link`. Default `a`. */
  as?: ElementType;
  round?: boolean;
  buddy?: boolean | "peek";
  /** Which character the buddy is. Default `success` (Pip); e.g. `error` puts Bix on a Retry button. */
  buddyMood?: BuddyMood;
  children: ReactNode;
}

/**
 * The same sticker as a link. Pointer presses squish it; Enter shows the
 * press (Space doesn't activate links, so it doesn't here either).
 */
export function StickerLink({
  ref,
  as: Tag = "a",
  variant = "ink",
  size = "md",
  tilt,
  seed,
  burst = false,
  round = false,
  buddy = false,
  buddyMood = "success",
  shadow,
  className,
  style,
  children,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onKeyDown,
  onBlur,
  ...rest
}: StickerLinkProps) {
  const autoSeed = useSeed(seed);
  const angle = tilt ?? seededTilt(autoSeed);
  const haptics = useHaptics();
  const inkBurst = useInkBurst();
  useBurstPreload(!!burst);
  const [pressed, setPressed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const press = () => {
    setPressed(true);
    haptics.tap();
  };
  const release = () => setPressed(false);

  return (
    <Tag
      {...rest}
      ref={ref}
      data-pressed={pressed ? "" : undefined}
      className={cx(styles.root, styles.link, variantClass[variant], size !== "md" && styles[size], round && styles.round, buddy === "peek" && styles.peek, className)}
      data-shadow={shadow}
      style={{ "--tilt": `${angle}deg`, ...style } as CSSProperties}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        const b = burstFor(burst, variant);
        if (b) inkBurst(event.currentTarget, b.colors, round ? 7 : 9, b.style);
        onClick?.(event);
      }}
      onPointerDown={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerDown?.(event);
        if (event.button === 0) press();
      }}
      onPointerUp={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerUp?.(event);
        release();
      }}
      onPointerLeave={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerLeave?.(event);
        release();
      }}
      onKeyDown={(event: KeyboardEvent<HTMLAnchorElement>) => {
        onKeyDown?.(event);
        if (event.key === "Enter" && !event.repeat) {
          press();
          timer.current = window.setTimeout(release, 110);
        }
      }}
      onBlur={(event: FocusEvent<HTMLAnchorElement>) => {
        onBlur?.(event);
        release();
      }}
    >
      <StickerInner buddy={buddy} buddyMood={buddyMood} loading={false} loadingLabel="">
        {children}
      </StickerInner>
    </Tag>
  );
}

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

const ink = { stroke: "var(--plop-ink)" };
const inkFill = { fill: "var(--plop-ink)" };
const paperFill = { fill: "var(--plop-paper)" };

function BuddyHead() {
  return (
    <span className={styles.buddyHead} aria-hidden="true">
      <svg viewBox="0 0 84 68">
        <g fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={ink}>
          <path d="M16 48 C 14 28, 28 18, 44 18 C 60 18, 70 30, 68 46 C 66 60, 56 66, 42 66 C 26 66, 17 60, 16 48 Z" style={paperFill} />
          <path d="M18 49 C 9 45, 7 59, 18 61" style={paperFill} />
          <path d="M15 52 C 13 54, 14 57, 17 58" strokeWidth="2.2" />
          <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" stroke="none" transform="translate(2.5 2)" style={{ fill: "var(--plop-bubblegum)" }} />
          <path d="M16 41 C 15 18, 60 10, 68 36 C 50 32, 32 34, 16 41 Z" />
          <path d="M62 34 C 72 29, 83 31, 83 37 C 77 42, 68 42, 62 40 Z" style={paperFill} />
          <circle cx="40" cy="15" r="2.4" stroke="none" style={inkFill} />
        </g>
        <g className={styles.faceIdle}>
          <g className={styles.blink}>
            <ellipse cx="46" cy="47" rx="2.3" ry="3.5" style={inkFill} />
            <ellipse cx="58" cy="46" rx="2.3" ry="3.5" style={inkFill} />
          </g>
          <path d="M46 56 C 51 61, 58 60, 62 53" fill="none" strokeWidth="2.6" strokeLinecap="round" style={ink} />
        </g>
        <g className={styles.facePress} fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={ink}>
          <path d="M42 44 L 48 47 L 42 50" />
          <path d="M62 43 L 56 46 L 62 49" />
          <ellipse cx="53" cy="57" rx="2.4" ry="3" stroke="none" style={inkFill} />
        </g>
        <g className={styles.faceHappy} fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={ink}>
          <path d="M42 48 C 44 43, 48 43, 50 48" />
          <path d="M55 47 C 57 42, 61 42, 63 47" />
          <path d="M45 53 C 47 62, 59 62, 62 52 Z" style={{ fill: "var(--plop-tomato)" }} />
        </g>
      </svg>
    </span>
  );
}

function BuddyHands() {
  return (
    <span className={styles.buddyHands} aria-hidden="true">
      <svg viewBox="0 0 84 22">
        <g strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ ...ink, ...paperFill }}>
          <path d="M14 14 C 13 5, 27 4, 28 13 C 28 18, 15 19, 14 14 Z" />
          <path d="M56 13 C 56 4, 70 5, 70 14 C 69 19, 56 18, 56 13 Z" />
        </g>
        <g fill="none" strokeWidth="1.8" strokeLinecap="round" style={ink}>
          <path d="M19 12 L 19 16" />
          <path d="M23 12 L 23 16" />
          <path d="M61 12 L 61 16" />
          <path d="M65 12 L 65 16" />
        </g>
      </svg>
    </span>
  );
}
