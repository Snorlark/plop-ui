import { screen } from "@testing-library/react";
import { renderWithPlop } from "../../test/render";
import { Doodle } from "../Doodle/Doodle";
import { WordSticker } from "./WordSticker";

describe("WordSticker", () => {
  it("reads its words once and letters them the same way every time", () => {
    const { container, rerender } = renderWithPlop(<WordSticker tone="tomato">Plop!</WordSticker>);
    expect(screen.getAllByText("Plop!").filter((el) => !el.closest('[aria-hidden="true"]'))).toHaveLength(1);
    const sticker = () => container.querySelector("[style*='--ws-fill']")?.outerHTML;
    const first = sticker();
    rerender(<WordSticker tone="tomato">Plop!</WordSticker>);
    expect(sticker()).toBe(first);
  });

  it("takes size, tilt and tone", () => {
    const { container } = renderWithPlop(<WordSticker size={72} tilt={-4} tone="mint">Hi</WordSticker>);
    const root = container.querySelector("[style*='--ws-tilt']") as HTMLElement;
    expect(root.style.fontSize).toBe("72px");
    expect(root.style.getPropertyValue("--ws-tilt")).toBe("-4deg");
    expect(root.style.getPropertyValue("--ws-fill")).toBe("var(--plop-mint)");
  });
});

describe("Doodle", () => {
  it("is decorative and never takes focus", () => {
    const { container } = renderWithPlop(<Doodle kind="star" />);
    const svg = container.querySelector("svg[viewBox='0 0 100 100']");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });
});
