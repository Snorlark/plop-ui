import props from "../_generated/props.json";

type Name = keyof typeof props;

/** Props for a component, generated from @plop-ui/react's TypeScript types (scripts/gen-props.mjs). */
export function PropsTable({ of, inheritedFrom }: { of: Name; inheritedFrom?: string }) {
  const entry = props[of];
  return (
    <>
      <div className="table-wrap" tabIndex={0} role="region" aria-label={`${of} props`}>
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code>{p.name}</code>
                  {p.required && <span className="req"> required</span>}
                </td>
                <td>
                  <code>{p.type}</code>
                </td>
                <td>{p.description}</td>
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
