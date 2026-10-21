import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithPlop } from "../../test/render";
import { PhoneIcon } from "../icons";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("uses label as the accessible name", () => {
    renderWithPlop(<IconButton icon={<PhoneIcon />} label="Start SOS call" />);
    expect(screen.getByRole("button", { name: "Start SOS call" })).toBeInTheDocument();
  });

  it("hides the icon from screen readers", () => {
    renderWithPlop(<IconButton icon={<PhoneIcon data-testid="icon" />} label="Call" />);
    expect(screen.getByTestId("icon").closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("works from the keyboard", async () => {
    const onClick = vi.fn();
    renderWithPlop(<IconButton icon={<PhoneIcon />} label="Call" onClick={onClick} />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("requires a label at compile time", () => {
    // @ts-expect-error — label is required so the button always has a name.
    const el = <IconButton icon={<PhoneIcon />} />;
    expect(el).toBeTruthy();
  });
});
