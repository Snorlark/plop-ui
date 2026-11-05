import { surfaceNames, surfaces } from "@plop-ui/tokens";
import { contrastRatio } from "../contrast";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { Breadcrumb } from "./Breadcrumb";

const items = [{ label: "Home", href: "/" }, { label: "Docs", href: "/docs" }, { label: "Button", href: "/button" }];

describe("Breadcrumb", () => {
  it("uses text roles that pass AA on all surfaces in both themes", () => {
    for (const surface of surfaceNames) {
      for (const theme of ["light", "dark"] as const) {
        const { on, onSoft, bg } = surfaces[surface][theme];
        expect(contrastRatio(on, bg), `${surface} ${theme} current`).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(onSoft, bg), `${surface} ${theme} link`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it("uses a named nav, ordered list and a non-linked current page", () => {
    renderWithPlop(<Breadcrumb items={items} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("list").tagName).toBe("OL");
    expect(screen.getByText("Button")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Button" })).not.toBeInTheDocument();
    for (const separator of nav.querySelectorAll("svg")) expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("tabs through ancestor links in order and activates them with Enter", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    // Router adapters receive real anchor semantics and keyboard activation.
    function RouterLink({ children, ...props }: React.ComponentProps<"a">) {
      return <a {...props} href={props.href} onClick={(event) => { event.preventDefault(); navigate(props.href); }}>{children}</a>;
    }
    renderWithPlop(<Breadcrumb as={RouterLink} collapse={false} items={items} />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(navigate).toHaveBeenLastCalledWith("/");
    await user.tab();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(navigate).toHaveBeenLastCalledWith("/docs");
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("expands with Enter and collapses with Space without losing focus", async () => {
    const user = userEvent.setup();
    renderWithPlop(<Breadcrumb items={items} expandLabel="Show parents" collapseLabel="Hide parents" />);
    // JSDOM does not apply container queries; exercise the native disclosure directly.
    const toggle = screen.getByRole("button", { name: "Show parents", hidden: true });
    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("Hide parents");
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("handles empty, single-page and non-navigable ancestors", () => {
    const { rerender } = renderWithPlop(<Breadcrumb items={[]} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    rerender(<Breadcrumb items={[{ label: "Home" }]} aria-label="Location" />);
    expect(screen.getByRole("navigation", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByText("Home")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { hidden: true })).not.toBeInTheDocument();
    rerender(<Breadcrumb items={[{ label: "Category" }, { label: "Page" }]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Category")).not.toHaveAttribute("aria-current");
  });
});
