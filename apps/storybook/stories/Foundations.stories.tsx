import { onColor, useBoil, useHaptics, Button } from "@plop-ui/react";
import { color, surfaces } from "@plop-ui/tokens";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = { title: "Foundations" } satisfies Meta;
export default meta;
type Story = StoryObj;

const swatches = ["ink", "tomato", "mustard", "bubblegum", "periwinkle", "mint", "paper"] as const;

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
      {swatches.map((name) => {
        const bg = color[name];
        const on = onColor(bg);
        return (
          <div key={name} style={{ width: 130, padding: 16, background: bg, color: on.color, border: "2.5px solid var(--plop-ink)", borderRadius: "var(--plop-radius-box)" }}>
            <div style={{ fontSize: 30, fontStyle: "italic", fontWeight: 700 }}>Aa</div>
            <strong style={{ textTransform: "uppercase", fontStyle: "italic" }}>{name}</strong>
            <div style={{ fontFamily: "var(--plop-font-mono)", fontSize: 12 }}>{bg}</div>
            <div style={{ fontSize: 15 }}>{on.ratio.toFixed(1)}:1</div>
          </div>
        );
      })}
    </div>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <p style={{ maxWidth: "40ch", lineHeight: 1.5 }}>
      Use the <strong>Surface</strong> and <strong>Theme</strong> toolbar menus above to see every component on the {Object.keys(surfaces).length} papers, in
      light and dark.
    </p>
  ),
};

function TryAnyFillDemo() {
    const [fill, setFill] = useState("#7FB3E8");
    const on = onColor(fill);
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <label>
          Pick a fill <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} />
        </label>
        <span style={{ background: fill, color: on.color, padding: "8px 16px", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase" }}>Auto contrast</span>
        <span>
          {on.color === "#1C2E8C" ? "Deep ink" : "Cream"}, {on.ratio.toFixed(1)}:1 {on.passesAA ? "(AA)" : "(fails AA)"}
        </span>
      </div>
    );
  }

export const TryAnyFill: Story = {
  name: "onColor (try any fill)",
  render: () => <TryAnyFillDemo />,
};

function BoilDemo() {
    const [active, setActive] = useState(true);
    const boil = useBoil({ seed: "star", active });
    return (
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={boil} aria-hidden="true">
          <path d="M60 10 L 74 44 L 110 46 L 82 68 L 92 104 L 60 84 L 28 104 L 38 68 L 10 46 L 46 44 Z" fill="var(--plop-mustard)" stroke="var(--plop-ink)" strokeWidth="5" strokeLinejoin="round" />
        </svg>
        <Button size="sm" variant="plain" onClick={() => setActive((a) => !a)}>
          {active ? "Hold still" : "Boil"}
        </Button>
      </div>
    );
  }

export const Boil: Story = {
  name: "useBoil",
  render: () => <BoilDemo />,
};

function HapticsDemo() {
    const h = useHaptics();
    return (
      <div style={{ display: "flex", gap: 24 }}>
        <Button size="sm" onClick={h.tap}>Tap</Button>
        <Button size="sm" variant="mint" onClick={h.success}>Success</Button>
        <Button size="sm" variant="tomato" onClick={h.error}>Error</Button>
      </div>
    );
  }

export const Haptics: Story = {
  name: "useHaptics",
  render: () => <HapticsDemo />,
};
