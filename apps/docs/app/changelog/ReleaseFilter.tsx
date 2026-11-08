"use client";

import { Button, Radio, RadioGroup } from "@plop-ui/react";
import { useRouter } from "next/navigation";
import { PACKAGES } from "../_site/changelog-packages";
import { changelogHref, type PackageFilter } from "./pagination";
import styles from "./changelog.module.css";

/** Changing packages starts at page one; a GET form also works without JavaScript. */
export function ReleaseFilter({ pkg }: { pkg: PackageFilter }) {
  const router = useRouter();
  return (
    <form action="/changelog" method="get">
      <RadioGroup legend="Show" name="pkg" value={pkg} vertical={false} className={styles.filter}
        onValueChange={(value) => router.push(changelogHref(1, value as PackageFilter))}>
        <Radio value="all">Everything</Radio>
        {PACKAGES.map((name) => <Radio key={name} value={name}>{name}</Radio>)}
      </RadioGroup>
      <noscript><Button type="submit" size="sm">Show releases</Button></noscript>
    </form>
  );
}
