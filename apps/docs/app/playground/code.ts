/*
 * Helpers for the snippets the Playground copies: whatever someone types on the
 * board has to reach the clipboard as the same words, in code that compiles.
 */

/** A text child for the copied JSX. Braces and angle brackets would be read as JSX, so a value
 * containing them becomes a {"..."} expression that renders the same words; quotes stay as they are. */
export const jsxText = (value: unknown): string => {
  const text = String(value ?? "");
  return /[{}<>&]/.test(text) ? `{${JSON.stringify(text)}}` : text;
};

/** A prop value. Plain words keep the readable `label="..."` shape; values with quotes, line breaks
 * or an ampersand that could be read as an entity become a {"..."} expression instead. */
export const jsxAttr = (value: unknown): string => {
  const text = String(value ?? "");
  return /["&\n\r\t]/.test(text) ? `{${JSON.stringify(text)}}` : `"${text}"`;
};

/** A JavaScript string for the copied snippet, like toast("Posted"): JSON quoting keeps every character. */
export const jsString = (value: unknown): string => JSON.stringify(String(value ?? ""));
