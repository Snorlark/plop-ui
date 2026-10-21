import { useId } from "react";
import { hashString, type Seed } from "../seed.js";

/**
 * The seed a component uses for its imperfections: the `seed` prop when
 * given, else React's `useId()`, which is identical on server and client.
 * (useId is allowed in Server Components too.)
 */
export function useSeed(seed?: Seed): Seed {
  const id = useId();
  return seed ?? hashString(id);
}
