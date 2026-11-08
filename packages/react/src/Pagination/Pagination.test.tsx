import { useState, type ComponentProps } from "react";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { renderWithPlop } from "../../test/render";
import { Pagination } from "./Pagination";

function LocalPages({ initial = 5, pageCount = 20 }: { initial?: number; pageCount?: number }) {
  const [page, setPage] = useState(initial);
  return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />;
}

describe("Pagination", () => {
  it("uses native navigation and marks exactly one current page", () => {
    renderWithPlop(<Pagination page={3} pageCount={5} />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("list").tagName).toBe("UL");
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("type", "button");
  });

  it("activates pages with Enter and Space and keeps focus on a numbered page", async () => {
    const user = userEvent.setup();
    renderWithPlop(<LocalPages />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Previous" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
    const nextPage = screen.getByRole("button", { name: "Page 5" });
    nextPage.focus();
    await user.keyboard(" ");
    expect(nextPage).toHaveFocus();
    expect(nextPage).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
  });

  it("disables Previous and Next at their bounds and skips them in keyboard order", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = renderWithPlop(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPageChange).not.toHaveBeenCalled();
    rerender(<Pagination page={3} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("renders real destinations through a router adapter and preserves modified-click behavior", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    function RouterLink({ children, ...props }: ComponentProps<"a">) { return <a {...props} href={props.href} data-router="">{children}</a>; }
    renderWithPlop(<Pagination page={2} pageCount={3} href={(page) => `#page-${page}`} as={RouterLink} onPageChange={change} />);
    const link = screen.getByRole("link", { name: "Page 3" });
    expect(link).toHaveAttribute("href", "#page-3");
    expect(link).toHaveAttribute("data-router", "");
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("rel", "prev");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("rel", "next");
    fireEvent.click(link, { ctrlKey: true, button: 0 });
    expect(change).not.toHaveBeenCalled();
    link.focus();
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenCalledWith(3);
  });

  it("never builds unavailable destinations, including disabled link mode", () => {
    const href = vi.fn((page: number) => `#page-${page}`);
    const { rerender } = renderWithPlop(<Pagination page={1} pageCount={1} href={href} />);
    expect(href).toHaveBeenCalledTimes(1);
    expect(href).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    href.mockClear();
    rerender(<Pagination page={2} pageCount={5} href={href} disabled />);
    expect(href).not.toHaveBeenCalled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it.each([1, 2, 5, 10, 19, 20])("keeps first, last and current page visible in a bounded range at %s", (page) => {
    const { container } = renderWithPlop(<Pagination page={page} pageCount={20} />);
    for (const target of [1, page, 20]) expect(screen.getByRole("button", { name: `Page ${target}` })).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBeLessThanOrEqual(9);
    for (const gap of container.querySelectorAll('[aria-hidden="true"]')) {
      if (gap.textContent === "…") expect(gap).not.toHaveAttribute("tabindex");
    }
  });

  it("does not render a control for every page of a huge list", () => {
    renderWithPlop(<Pagination page={50000} pageCount={100000} />);
    expect(screen.getAllByRole("button").length).toBeLessThanOrEqual(9);
    expect(screen.getByRole("button", { name: "Page 50000" })).toHaveAttribute("aria-current", "page");
  });

  it.each([[0, 5, 1], [10, 5, 5], [2.9, 5.5, 2], [NaN, 5, 1]])("normalizes page %s of %s", (page, pageCount, expected) => {
    renderWithPlop(<Pagination page={page} pageCount={pageCount} />);
    expect(screen.getByRole("button", { name: `Page ${expected}` })).toHaveAttribute("aria-current", "page");
  });

  it.each([0, -1, NaN, Infinity])("renders nothing for invalid or empty count %s", (pageCount) => {
    renderWithPlop(<Pagination page={1} pageCount={pageCount} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("supports translated control labels and independent landmark names", () => {
    renderWithPlop(<Pagination page={2} pageCount={4} aria-label="Résultats" previousLabel="Précédent" nextLabel="Suivant" getPageLabel={(page) => `Aller à la page ${page}`} />);
    expect(screen.getByRole("navigation", { name: "Résultats" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Précédent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aller à la page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("generates link destinations during server rendering", () => {
    const markup = renderToStaticMarkup(<Pagination page={2} pageCount={3} href={(page) => `/articles?page=${page}`} />);
    expect(markup).toContain('href="/articles?page=3"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toContain("function");
  });
});
