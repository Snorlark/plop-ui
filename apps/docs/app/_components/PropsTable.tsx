import props from "../_generated/props.json";

type Name = keyof typeof props;

/** Props for a component, generated from @plop-ui/react's TypeScript types (scripts/gen-props.mjs). */
export function PropsTable({ of, inheritedFrom }: { of: Name; inheritedFrom?: string }) {
  const entry = props[of];
  return (
    <>
      <div className="doc-table" tabIndex={0} role="region" aria-label={`${of} props`}>
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name}>
                <td className="mono">
                  {p.name}
                  {p.required && <span className="req"> required</span>}
                </td>
                <td className="mono">{p.type}</td>
                <td className="mono">{p.default ?? (p.required ? "—" : p.type === "boolean" ? "false" : "none")}</td>
                <td>{p.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entry.inherited > 0 && inheritedFrom && (
        <p className="props-inherited">
          Also takes every attribute of {inheritedFrom} ({entry.inherited} more, e.g. <code>onClick</code>, <code>className</code>, <code>aria-*</code>).
        </p>
      )}
    </>
  );
}
