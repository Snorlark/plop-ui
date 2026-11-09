"use client";

import { useSyncExternalStore } from "react";
import { Button, Radio, RadioGroup } from "@plop-ui/react";
import { PACKAGES } from "../_site/changelog-packages";
import { changelogHref, type PackageFilter } from "./pagination";
import styles from "./changelog.module.css";

const subscribe = () => () => {};
const enhanced = () => true;
const server = () => false;

/** Changing packages starts at page one; a GET form also works without JavaScript. */
export function ReleaseFilter({ pkg }: { pkg: PackageFilter }) {
  // Keep a working GET submit button until the radio change handler is hydrated.
  const autoApply = useSyncExternalStore(subscribe, enhanced, server);
  return (
    <form action="/changelog" method="get">
      <RadioGroup legend="Show" name="pkg" value={pkg} vertical={false} className={styles.filter}
        onValueChange={(value) => window.location.assign(changelogHref(1, value as PackageFilter))}>
        <Radio value="all">Everything</Radio>
        {PACKAGES.map((name) => <Radio key={name} value={name}>{name}</Radio>)}
      </RadioGroup>
      {!autoApply && <Button type="submit" size="sm">Show releases</Button>}
    </form>
  );
}
