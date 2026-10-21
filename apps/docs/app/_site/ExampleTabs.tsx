"use client";

import { Tab, TabList, TabPanel, Tabs } from "@plop-ui/react";
import { KitDemo } from "../_kit/demos";

/** Preview / Code index-card tabs on every component page. */
export function ExampleTabs({ slug, code }: { slug: string; code: string }) {
  return (
    <Tabs defaultValue="preview" className="doc-example">
      <TabList label="Example">
        <Tab value="preview">Preview</Tab>
        <Tab value="code">Code</Tab>
      </TabList>
      <TabPanel value="preview" className="doc-example__preview">
        <KitDemo slug={slug} />
      </TabPanel>
      <TabPanel value="code" className="doc-example__code">
        <pre>
          <code>{code}</code>
        </pre>
      </TabPanel>
    </Tabs>
  );
}
