"use client";

import { useState } from "react";
import { Switch } from "@plop-ui/react";

/** Switch: a face that sleeps when off and wakes up when on. Clicking the label toggles it too. */
export function SwitchExample() {
  const [sharing, setSharing] = useState(false);
  return (
    <>
      <Switch checked={sharing} onCheckedChange={setSharing} color="mint">
        Share live location
      </Switch>
      <Switch defaultChecked>Email me replies</Switch>
    </>
  );
}
