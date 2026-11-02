"use client";

import { useState } from "react";
import { Checkbox } from "@plop-ui/react";

const people = ["Rosa", "Theo", "Mia"];

/** Checkbox: a hand-drawn tick, with a "select all" that shows a dash when only some are picked. */
export function CheckboxExample() {
  const [picked, setPicked] = useState<string[]>(["Rosa"]);
  const all = picked.length === people.length;
  const some = picked.length > 0 && !all;
  return (
    <>
      <Checkbox checked={all} indeterminate={some} onCheckedChange={(on) => setPicked(on ? people : [])}>
        Everyone
      </Checkbox>
      {people.map((name) => (
        <Checkbox
          key={name}
          checked={picked.includes(name)}
          onCheckedChange={(on) => setPicked((p) => (on ? [...p, name] : p.filter((n) => n !== name)))}
        >
          {name}
        </Checkbox>
      ))}
      <Checkbox tickColor="var(--plop-leaf)">Weekly digest, by email</Checkbox>
    </>
  );
}
