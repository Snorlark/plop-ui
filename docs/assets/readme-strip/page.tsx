// Source of apps/docs/public/readme/components.png (1200x440 at 2x), the component strip in the npm READMEs.
// To re-render: copy to apps/docs/app/readme-strip/page.tsx, run the docs dev server, hide the Ride-along ticket,
// screenshot #strip at deviceScaleFactor 2, save it to public/readme/components.png, then delete the route again.
"use client";

import { AvatarStack, Button, Checkbox, Count, PlopProvider, Select, StatusTimeline, StickyNote, Switch, Tag, Toast, WordSticker } from "@plop-ui/react";
import type { CSSProperties, ReactNode } from "react";

const At = ({ x, y, rot = 0, children }: { x: number; y: number; rot?: number; children: ReactNode }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)` } as CSSProperties}>{children}</div>
);

/** The "what's in the kit" strip for the npm READMEs (1200x440), rendered from the real library. */
export default function ReadmeStrip() {
  return (
    <PlopProvider surface="poster" haptics={false}>
      <div id="strip" style={{ position: "relative", width: 1200, height: 440, overflow: "hidden", background: "var(--plop-bg)" }} className="plop-surface">
        <At x={46} y={70} rot={-3}><Button size="lg" buddy>Post sketch</Button></At>
        <At x={330} y={70} rot={2}><Tag tone="tomato" tilt={0}>Wild idea</Tag></At>
        <At x={470} y={60} rot={-2}><Tag tone="mustard" tilt={0}>In progress</Tag></At>
        <At x={420} y={112} rot={1}><Tag tone="mint" tilt={0}>Shipped</Tag></At>
        <At x={640} y={50} rot={-1}><div style={{ width: 250 }}><Select label="Brush" options={[{ value: "marker", label: "Marker", lead: { dot: "mustard" } }]} defaultValue="marker" /></div></At>
        <At x={935} y={44} rot={4}><StickyNote tone="pink" tilt={0} style={{ width: 220 }}>Try the mint. It's louder, in a good way.</StickyNote></At>
        <At x={48} y={214} rot={1}><div style={{ width: 430 }}><StatusTimeline steps={["Sketched", "Inked", "Colored", "Shipped"]} current={2} orientation="horizontal" label="Sample sketch" /></div></At>
        <At x={540} y={226} rot={-3}><Switch defaultChecked aria-label="Sample switch" /></At>
        <At x={640} y={232} rot={2}><Checkbox defaultChecked>Notify my friends</Checkbox></At>
        <At x={960} y={250} rot={-2}><AvatarStack names={["Rosa Santos", "Jun Reyes", "Mika Tan", "Ana Cruz"]} /></At>
        <At x={70} y={330} rot={-2}><Toast kind="success">Sketch posted</Toast></At>
        <At x={400} y={326} rot={-6}><WordSticker tone="mustard" size={54} tilt={0}>Plop!</WordSticker></At>
        <At x={610} y={340} rot={3}><Count label="3 new">3</Count></At>
        <At x={700} y={344} rot={-1}><Button variant="mint" size="sm">Mark as shipped</Button></At>
        <At x={950} y={352} rot={4}><Button variant="tomato" size="sm">Delete draft</Button></At>
      </div>
    </PlopProvider>
  );
}
