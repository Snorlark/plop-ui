"use client";

import { Button, Loader, PlopProvider, Progress, ProgressRing, Skeleton, SkeletonText, Spinner, type SpinnerKind } from "@plop-ui/react";

const KINDS: SpinnerKind[] = ["ink", "dots", "scribble", "sticker", "buddy"];

export function LoadingBoard() {
  return (
    <PlopProvider surface="notebook" theme="light">
      <main data-testid="loading-lab" style={{ display: "grid", gap: 28, padding: 32 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {Array.from({ length: 150 }, (_, i) => (
            <Spinner key={i} kind={KINDS[i % KINDS.length]} size={i % 3 === 0 ? "lg" : "md"} label={`Loading ${i}`} seed={i} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} aria-busy="true" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Skeleton shape="circle" seed={`c${i}`} />
              <span style={{ flex: 1 }}>
                <SkeletonText lines={2} seed={`t${i}`} />
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <Progress key={i} label={`Syncing ${i}`} indeterminate />
          ))}
          <div style={{ display: "flex", gap: 16 }}>
            <ProgressRing label="Ring" value={40} />
            <Button loading loadingLabel="Sending">
              Send
            </Button>
          </div>
          <Loader label="Loading the crew" slowAfter={0} />
        </div>
      </main>
    </PlopProvider>
  );
}
