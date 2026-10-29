"use client";

import { Button, ButtonLink, IconButton, Menu, MultiSelect, PlopProvider, PlusIcon, SearchField, Select, Tab, TabList, TabPanel, Tabs, Tag, TextField } from "@plop-ui/react";

const OPTIONS = [
  { value: "pencil", label: "Pencil" },
  { value: "marker", label: "Marker" },
];

function Kit() {
  return (
    <>
      <Button data-testid="button">Post sketch</Button>
      <ButtonLink href="#top" data-testid="button-link">
        Open the sketchbook
      </ButtonLink>
      <IconButton icon={<PlusIcon />} label="New sketch" data-testid="icon-button" />
      <Tag data-testid="tag">In progress</Tag>
      <Select label="Brush" options={OPTIONS} />
      <MultiSelect label="Colors" options={OPTIONS} />
      <Menu label="Sketch actions" items={[{ label: "Duplicate", onSelect: () => {} }]} />
      <TextField label="Title" />
      <SearchField label="Search sketches" />
      <Tabs defaultValue="sketch">
        <TabList label="Sketch views">
          <Tab value="sketch">Sketch</Tab>
          <Tab value="ink">Ink</Tab>
        </TabList>
        <TabPanel value="sketch">Sketching.</TabPanel>
        <TabPanel value="ink">Inking.</TabPanel>
      </Tabs>
    </>
  );
}

export function StressBoard() {
  return (
    <div id="top">
      {/* A grid that stretches every child, like a fresh `display: grid; min-height: 100vh` page. */}
      <PlopProvider surface="notebook" theme="light" data-testid="grid-light">
        <main style={{ display: "grid", gap: 24, minHeight: "100vh", padding: 32 }}>
          <Kit />
        </main>
      </PlopProvider>
      <PlopProvider surface="notebook" theme="dark" data-testid="grid-dark">
        <section style={{ display: "grid", gap: 24, padding: 32 }}>
          <Kit />
        </section>
      </PlopProvider>
      {/* A flex row that stretches heights. */}
      <PlopProvider surface="poster" theme="light" data-testid="row">
        <div style={{ display: "flex", gap: 16, padding: 32, height: 260 }}>
          <Button>Row button</Button>
          <IconButton icon={<PlusIcon />} label="Row add" />
        </div>
      </PlopProvider>
    </div>
  );
}
