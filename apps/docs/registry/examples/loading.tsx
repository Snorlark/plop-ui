"use client";

import { useState } from "react";
import { Avatar, Button, Loader, Progress, ProgressRing, Select, SkeletonText, Spinner, useDelayedLoading } from "@plop-ui/react";

/** Loading states: spinners, progress, skeletons, built-in loading props, and a loader card. */
export function LoadingExample() {
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  // Show a spinner only if the wait passes 300 ms, so quick loads never flicker.
  const showSpinner = useDelayedLoading(loading);

  return (
    <>
      <Spinner label="Loading sketches" />
      <Spinner kind="dots" showLabel label="Saving your board" />
      <Button
        loading={sending}
        loadingLabel="Sending"
        onClick={() => {
          setSending(true);
          setTimeout(() => setSending(false), 1500);
        }}
      >
        Send report
      </Button>

      <Progress label="Syncing reports" value={4} max={10} valueText="4 of 10" />
      <Progress label="Finding a free table" indeterminate />
      <ProgressRing label="Uploading photos" value={64} />

      <section aria-busy={loading}>
        {loading ? <SkeletonText lines={3} /> : <p>Here's the note that was loading.</p>}
      </section>
      <Button variant="plain" onClick={() => setLoading((l) => !l)}>
        {loading ? "Finish loading" : "Load again"}
      </Button>
      {showSpinner && <Spinner label="Still loading" />}

      {/* Built in: one prop, no custom CSS. */}
      <Select label="Brush" options={[]} loading />
      <Avatar name="Rosa Santos" loading />

      <Loader variant="card" paper="dots" label="Pressing your page" slowAfter={4000} onCancel={() => setLoading(false)} />
    </>
  );
}
