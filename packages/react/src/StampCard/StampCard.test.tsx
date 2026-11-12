import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { color } from "@plop-ui/tokens";
import { contrastRatio } from "../contrast";
import { StampCard, STAMP_INKS } from "./StampCard";

const stamps = () => document.querySelectorAll<HTMLElement>("li > [aria-hidden='true']");

describe("StampCard", () => {
  it("is an ordered list named with the progress, one item per slot", () => {
    render(<StampCard total={8} filled={3} />);
    const list = screen.getByRole("list", { name: "3 of 8 stamps" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(8);
  });

  it("puts the card's name before the count", () => {
    const { rerender } = render(<StampCard total={8} filled={3} title="Matcha Corner" />);
    expect(screen.getByRole("list", { name: "Matcha Corner, 3 of 8 stamps" })).toBeInTheDocument();
    expect(screen.getByText("Matcha Corner")).toBeVisible();
    rerender(<StampCard total={8} filled={3} title={<b>Matcha Corner</b>} label="Matcha Corner loyalty card" />);
    expect(screen.getByRole("list", { name: "Matcha Corner loyalty card, 3 of 8 stamps" })).toBeInTheDocument();
  });

  it("writes each slot's state in text, not just a picture", () => {
    render(<StampCard total={4} filled={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["Stamped", "Stamped", "Empty", "Empty"]);
  });

  it("shows the count once on the card, hidden from screen readers since the list already says it", () => {
    const { rerender } = render(<StampCard total={8} filled={3} />);
    const shown = screen.getByText("3 of 8 stamps", { selector: "span" });
    expect(shown).toHaveAttribute("aria-hidden", "true");
    rerender(<StampCard total={8} filled={3} showCount={false} />);
    expect(screen.queryByText("3 of 8 stamps", { selector: "span" })).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "3 of 8 stamps" })).toBeInTheDocument();
  });

  it("takes its own words", () => {
    render(<StampCard total={5} filled={1} countText={(f, t) => `${f} sa ${t} na selyo`} statusText={{ filled: "May selyo", empty: "Wala pa" }} />);
    expect(screen.getByRole("list", { name: "1 sa 5 na selyo" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("May selyo");
    expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("Wala pa");
  });

  it("says 1 stamp, not 1 stamps", () => {
    render(<StampCard total={1} filled={1} />);
    expect(screen.getByRole("list", { name: "1 of 1 stamp" })).toBeInTheDocument();
  });

  it("clamps the numbers to whole slots", () => {
    const { rerender } = render(<StampCard total={4} filled={9} />);
    expect(screen.getByRole("list", { name: "4 of 4 stamps" })).toBeInTheDocument();
    rerender(<StampCard total={4} filled={-2} />);
    expect(screen.getByRole("list", { name: "0 of 4 stamps" })).toBeInTheDocument();
    rerender(<StampCard total={4.7} filled={2.9} />);
    expect(screen.getByRole("list", { name: "2 of 4 stamps" })).toBeInTheDocument();
    rerender(<StampCard total={0} filled={Number.NaN} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("presses a custom stamp into filled slots only, hidden from screen readers", () => {
    render(<StampCard total={5} filled={2} stamp={<svg data-testid="cup" />} />);
    const cups = screen.getAllByTestId("cup");
    expect(cups).toHaveLength(2);
    for (const cup of cups) expect(cup.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("lets a function draw each slot's stamp", () => {
    render(<StampCard total={3} filled={3} stamp={(i) => (i === 2 ? <span>FREE</span> : <span>★</span>)} />);
    expect(screen.getAllByText("★")).toHaveLength(2);
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });

  it("thunks only the newest stamp", () => {
    render(<StampCard total={6} filled={3} />);
    const latest = [...stamps()].map((s) => /latest/.test(s.className));
    expect(latest).toEqual([false, false, true]);
  });

  it("gives every stamp its own seeded tilt, the same on every render and on the server", () => {
    const card = <StampCard total={8} filled={8} seed="matcha-corner" />;
    const { unmount } = render(card);
    const looks = [...stamps()].map((s) => s.getAttribute("style"));
    expect(new Set(looks.map((l) => l?.match(/rotate\(([^)]+)\)/)?.[1])).size).toBeGreaterThan(1);
    unmount();
    render(card);
    expect([...stamps()].map((s) => s.getAttribute("style"))).toEqual(looks);
    expect(renderToStaticMarkup(card)).toBe(renderToStaticMarkup(card));
  });

  it("presses every stamp in one ink, or a seeded mix", () => {
    const { rerender } = render(<StampCard total={6} filled={6} ink="leaf" seed="a" />);
    expect([...stamps()].every((s) => s.style.color === "var(--plop-leaf)")).toBe(true);
    rerender(<StampCard total={6} filled={6} seed="a" />);
    const inks = [...stamps()].map((s) => s.style.color);
    expect(inks.every((v) => STAMP_INKS.some((name) => v === `var(--plop-${name})`))).toBe(true);
  });

  it("balances rows of at most 6 slots, or uses the columns asked for", () => {
    const cols = () => screen.getByRole("list").style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];
    const { rerender } = render(<StampCard total={8} filled={0} />);
    expect(cols()).toBe("4");
    rerender(<StampCard total={10} filled={0} />);
    expect(cols()).toBe("5");
    rerender(<StampCard total={4} filled={0} />);
    expect(cols()).toBe("4");
    rerender(<StampCard total={10} filled={0} columns={3} />);
    expect(cols()).toBe("3");
    rerender(<StampCard total={3} filled={0} columns={9} />);
    expect(cols()).toBe("3");
  });

  it("adds no tab stops: the keyboard moves straight past it", async () => {
    const user = userEvent.setup();
    render(<><button>Before</button><StampCard total={8} filled={3} title="Matcha Corner" /><button>After</button></>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("is printed on paper, so it reads the same on every surface", () => {
    const { container } = render(<StampCard total={2} filled={1} />);
    expect(container.firstElementChild).toHaveClass("plop-paper");
  });

  it("passes id, className and style through to the card", () => {
    const { container } = render(<StampCard total={2} filled={1} id="card" className="mine" style={{ maxWidth: 300 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "card");
    expect(root).toHaveClass("mine");
    expect(root.style.maxWidth).toBe("300px");
  });

  it("reads on its paper: AA text, and stamps and slots at 3:1 or more", () => {
    // .plop-paper prints on the sheet color with ink text.
    expect(contrastRatio(color.ink, color.sheet)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color.inkSoft, color.sheet)).toBeGreaterThanOrEqual(4.5);
    for (const name of STAMP_INKS) expect(contrastRatio(color[name], color.sheet), name).toBeGreaterThanOrEqual(3);
  });
});
