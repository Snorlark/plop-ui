import { BuddyPeek, ButtonLink } from "@plop-ui/react";
import Link from "next/link";
import { HoloPip, PlopPass } from "../_site/PlopPass";
import styles from "./PassCta.module.css";

/**
 * The last thing on the home page before the footer: the Plop Pass as a
 * call to action. Every stamp is a reason to try something (install, the
 * playground, the repo), and a full card gets you Holo Pip.
 */
export function PassCta() {
  return (
    <section className={styles.root} aria-labelledby="cta-h">
      <div className={styles.copy}>
        <span className={styles.kicker}>Regulars get a holo</span>
        <h2 id="cta-h" className={styles.title}>
          Five stamps.
          <br />
          <span>One foil sticker.</span>
        </h2>
        <p className={styles.lede}>Your Plop Pass fills up as you try things: visit, open the repo, copy the install command, stick something on the board, letter something. Fill it and Holo Pip is yours for good.</p>
        <div className={styles.actions}>
          <ButtonLink as={Link} href="/playground" size="lg" variant="ink" buddy buddyMood="congrats" tilt={-2}>
            Start stamping
          </ButtonLink>
          <ButtonLink as={Link} href="/docs/getting-started" variant="plain" tilt={2}>
            Read the docs
          </ButtonLink>
        </div>
      </div>
      <div className={styles.card}>
        <span className={styles.holo} aria-hidden="true">
          <HoloPip size={96} />
        </span>
        <BuddyPeek mood="preview" side="end" size="md">
          <PlopPass className={styles.pass} />
        </BuddyPeek>
      </div>
    </section>
  );
}
