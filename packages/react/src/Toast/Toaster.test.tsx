import { act, screen } from "@testing-library/react";
import { renderWithPlop } from "../../test/render";
import { toast } from "./store";

describe("Toaster", () => {
  it("shows a toast in a polite live region with the solid wash behind it by default", () => {
    renderWithPlop(<p>Board</p>);
    act(() => {
      toast.success("Copied to clipboard!");
    });
    const zone = screen.getByRole("status");
    expect(zone).toHaveAttribute("aria-live", "polite");
    expect(zone).toHaveAttribute("data-backdrop", "solid");
    expect(zone).toHaveTextContent("Copied to clipboard!");
  });

  it.each(["dots", "none"] as const)("takes the %s backdrop from PlopProvider", (backdrop) => {
    renderWithPlop(<p>Board</p>, { toastBackdrop: backdrop });
    expect(screen.getByRole("status")).toHaveAttribute("data-backdrop", backdrop);
  });
});
