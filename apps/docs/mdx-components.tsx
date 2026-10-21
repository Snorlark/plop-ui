import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    table: (props: ComponentProps<"table">) => (
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Table">
        <table {...props} />
      </div>
    ),
    // Code blocks can scroll sideways, so keyboard users need to be able to focus them.
    pre: (props: ComponentProps<"pre">) => <pre tabIndex={0} {...props} />,
    ...components,
  };
}
