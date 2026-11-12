/**
 * Speak a message through one shared, visually hidden polite live region on document.body.
 * For announcements that must outlive the component that made them, like a cart row that
 * unmounts right after its remove button is pressed. Call it from event handlers only.
 */
let region: HTMLElement | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

function getRegion() {
  if (region?.isConnected) return region;
  region = document.createElement("div");
  region.setAttribute("role", "status");
  region.setAttribute("aria-live", "polite");
  region.setAttribute("data-plop-announcer", "");
  Object.assign(region.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: "0",
  });
  document.body.append(region);
  return region;
}

export function announce(message: string) {
  if (typeof document === "undefined" || !message) return;
  const live = getRegion();
  // Clear first, then set on the next tick, so the same message twice in a row is still spoken.
  live.textContent = "";
  clearTimeout(timer);
  timer = setTimeout(() => {
    live.textContent = message;
  }, 50);
}
