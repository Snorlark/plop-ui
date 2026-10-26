// Generates app/_generated/props.json from @plop-ui/react's TypeScript types,
// so every props table on the docs site comes straight from the source.
// Only props declared inside packages/react are listed; inherited HTML
// attributes (onClick, className, ...) are summarized instead of dumped.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, "../../../packages/react");
const entry = join(pkg, "src/index.ts");
const out = join(here, "../app/_generated/props.json");

const COMPONENTS = {
  PlopProvider: "PlopProviderProps",
  Button: "ButtonProps",
  ButtonLink: "ButtonLinkProps",
  IconButton: "IconButtonProps",
  Tag: "TagProps",
  Switch: "SwitchProps",
  Checkbox: "CheckboxProps",
  StatusTimeline: "StatusTimelineProps",
  Tooltip: "TooltipProps",
  TextField: "TextFieldProps",
  TextArea: "TextAreaProps",
  RadioGroup: "RadioGroupProps",
  Radio: "RadioProps",
  SearchField: "SearchFieldProps",
  CommandPalette: "CommandPaletteProps",
  Buddy: "BuddyProps",
  BuddyPeek: "BuddyPeekProps",
  Avatar: "AvatarProps",
  AvatarStack: "AvatarStackProps",
  TicketCard: "TicketCardProps",
  UnitCard: "UnitCardProps",
  StickyNote: "StickyNoteProps",
  Tabs: "TabsProps",
  TabList: "TabListProps",
  Tab: "TabProps",
  Progress: "ProgressProps",
  Callout: "CalloutProps",
  Count: "CountProps",
  StatusDot: "StatusDotProps",
  Toast: "ToastProps",
  Sheet: "SheetProps",
  Heading: "HeadingProps",
  Lettering: "LetteringProps",
  WordSticker: "WordStickerProps",
  Doodle: "DoodleProps",
};

const program = ts.createProgram([entry], {
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const moduleSymbol = checker.getSymbolAtLocation(source);
const exports = new Map(checker.getExportsOfModule(moduleSymbol).map((s) => [s.name, s]));

const ownSrc = join(pkg, "src") + sep;
const isOwn = (decl) => decl.getSourceFile().fileName.split("/").join(sep).startsWith(ownSrc);

// What TypeScript expands ReactNode to; printed back as its name.
const REACT_NODE =
  /string \| number \| bigint \| boolean \| ReactElement<unknown, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| Promise<AwaitedReactNode>/g;

/** Pulls "Default `md`." (or "Defaults to …") out of a prop's description, for the Default column. */
function splitDefault(text) {
  const m = text.match(/(?:^|\s)Defaults?(?: to)?:?\s+(.+?)(?:\.(?=\s|$)|$)/);
  if (!m) return { description: text, defaultValue: null };
  const defaultValue = m[1].replace(/`/g, "").trim();
  const description = (text.slice(0, m.index) + text.slice(m.index + m[0].length)).replace(/\s{2,}/g, " ").trim();
  return { description, defaultValue };
}

const result = {};
for (const [component, propsName] of Object.entries(COMPONENTS)) {
  const symbol = exports.get(propsName);
  if (!symbol) throw new Error(`gen-props: ${propsName} is not exported from @plop-ui/react`);
  const type = checker.getDeclaredTypeOfSymbol(checker.getAliasedSymbol(symbol));
  const props = [];
  let inherited = 0;
  for (const prop of checker.getPropertiesOfType(type)) {
    const decl = prop.declarations?.[0];
    if (!decl || !isOwn(decl)) {
      inherited++;
      continue;
    }
    if (prop.name === "ref") continue;
    const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
    const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
    const t = checker.getNonNullableType(propType);
    let typeText = checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation);
    // PlopUI's own aliases (TagTone, StickerVariant, ...) mean nothing to a reader: show their options.
    const alias = t.aliasSymbol?.declarations?.[0];
    if (alias && isOwn(alias) && t.isUnion()) typeText = t.types.map((x) => checker.typeToString(x)).join(" | ");
    typeText = typeText.replace(/import\("[^"]+"\)\./g, "").replace(REACT_NODE, "ReactNode");
    const { description, defaultValue } = splitDefault(ts.displayPartsToString(prop.getDocumentationComment(checker)));
    props.push({ name: prop.name, type: typeText, required: !optional, default: defaultValue, description });
  }
  props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
  result[component] = { props, inherited };
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log(`gen-props: wrote ${Object.keys(result).length} components to app/_generated/props.json`);
