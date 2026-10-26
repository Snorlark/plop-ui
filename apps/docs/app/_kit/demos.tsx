"use client";

import { BuddyDemo } from "./BuddyDemo";
import { MenuDemo, SelectDemo } from "./DropdownDemo";
import { SearchDemo } from "./SearchDemo";
import {
  Avatar,
  AvatarStack,
  Button,
  Callout,
  Count,
  EmptyState,
  Eta,
  Heading,
  IconButton,
  InfoIcon,
  PhoneIcon,
  PinIcon,
  Progress,
  Radio,
  RadioGroup,
  Sheet,
  StatusDot,
  StickyNote,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TextArea,
  TextField,
  TicketCard,
  Toast,
  toast,
  Tooltip,
  UnitCard,
  UnitCardRow,
} from "@plop-ui/react";
import { Doodle, PlopProvider, WordSticker } from "@plop-ui/react";
import { surfaceNames, surfaces } from "@plop-ui/tokens";
import type { ReactNode } from "react";
import { ButtonBursts, ButtonHero, ButtonVariants, Checkboxes, IconButtons, Switches, TagFilters, TagStatuses, TimelineDemo } from "../_demos";

/** Live demos for the generic component pages (app/docs/components/[slug]). */
const DEMOS: Record<string, () => ReactNode> = {
  buddy: () => <BuddyDemo />,
  search: () => <SearchDemo />,
  select: () => <SelectDemo />,
  menu: () => <MenuDemo />,
  "word-sticker": () => (
    <div className="row" style={{ gap: 36, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
      <WordSticker tone="mustard" size={64} tilt={-4}>Plop!</WordSticker>
      <WordSticker tone="bubblegum" size={48} tilt={3} jitter={3.5}>Squish!</WordSticker>
      <WordSticker tone="mint" size={40}>All clear</WordSticker>
      <Doodle kind="star" size={56} tilt={-10} />
      <Doodle kind="heart" tone="bubblegum" size={52} />
      <Doodle kind="sparkle" tone="mustard" size={52} tilt={12} />
      <Doodle kind="burst" tone="mint" size={56} />
    </div>
  ),
  button: () => (
    <div className="stack" style={{ gap: 40, justifyItems: "center" }}>
      <ButtonHero />
      <ButtonVariants />
      <ButtonBursts />
    </div>
  ),
  "icon-button": () => <IconButtons />,
  tag: () => (
    <div className="stack" style={{ gap: 30 }}>
      <TagStatuses />
      <TagFilters />
    </div>
  ),
  switch: () => <Switches />,
  checkbox: () => <Checkboxes />,
  "status-timeline": () => <TimelineDemo />,
  provider: () => (
    <div className="surface-strip">
      {surfaceNames.map((s) => (
        <PlopProvider key={s} surface={s} theme="light" toaster={false} className="surface-strip__item">
          <span className="surface-strip__name">{surfaces[s].label}</span>
          <Button size="sm" seed={s}>Send</Button>
        </PlopProvider>
      ))}
    </div>
  ),
  tooltip: () => (
    <div className="row" style={{ paddingTop: 80, justifyContent: "space-around" }}>
      <Tooltip content="Priority sets who gets paged first.">
        <IconButton variant="plain" size="sm" icon={<InfoIcon size={22} />} label="What does priority do?" burst={false} />
      </Tooltip>
      <Tooltip content="Sends your live location for 30 minutes." side="right" open>
        <Button size="sm" iconLeft={<PinIcon />}>Pin to board</Button>
      </Tooltip>
    </div>
  ),
  "text-field": () => (
    <div className="fields">
      <TextField label="Artist name" placeholder="e.g. Maria Santos" hint="Optional. Anonymous sketches are fine." />
      <TextField label="Title" error="Give your sketch a title, even a silly one." />
      <TextField label="Callback number" defaultValue="0917 555 0142" success hint="Looks good." />
      <TextArea className="field--wide" label="What happened?" placeholder="Write it like you’d say it on the phone." />
    </div>
  ),
  radio: () => (
    <RadioGroup legend="Priority" defaultValue="medium">
      <Radio value="low">Low</Radio>
      <Radio value="medium" dotColor="var(--plop-mustard)">Medium</Radio>
      <Radio value="high" dotColor="var(--plop-tomato)">High, page everyone</Radio>
    </RadioGroup>
  ),
  avatar: () => (
    <div className="row">
      <Avatar name="Rosa Santos" size="xl" tilt={-5} />
      <Avatar name="Jun Reyes" status="online" />
      <Avatar name="Ana Cruz" status="busy" statusLabel="on a call" />
      <Avatar name="Leo Garcia" size="sm" />
      <AvatarStack names={["Rosa Santos", "Jun Reyes", "Ana Cruz", "Mika Tan", "Ben Ocampo", "Paolo Lim", "Carla Diaz"]} />
    </div>
  ),
  cards: () => (
    <div className="kit-cards">
      <TicketCard meta="Sketch #1042, 9:14 AM" title="Cat in a teacup, take two" stub="Open">
        <Tag tone="mustard" tilt={-2}>Medium</Tag>
      </TicketCard>
      <UnitCard name="Jun Reyes" subtitle="Animator, 2 boards open" avatar={<Avatar name="Jun Reyes" status="online" />}>
        <UnitCardRow>
          <Tag status="en-route" tilt={-2}>In progress</Tag>
          <Eta value={6} unit="min left" />
        </UnitCardRow>
        <UnitCardRow>
          <Button size="sm" iconLeft={<PhoneIcon />}>Call Jun</Button>
        </UnitCardRow>
      </UnitCard>
      <StickyNote footer="Added by Ana, 9:06 AM">Try the mint on the button. It's louder, in a good way.</StickyNote>
    </div>
  ),
  tabs: () => (
    <Tabs defaultValue="active">
      <TabList label="Your sketches">
        <Tab value="active" badge={<Count label="3 active" size="sm">3</Count>}>Active</Tab>
        <Tab value="resolved">Shipped</Tab>
        <Tab value="flagged">Flagged</Tab>
      </TabList>
      <TabPanel value="active">Cat in a teacup · Poster for the zine fair · Rosa’s comic, page 3</TabPanel>
      <TabPanel value="resolved">Birthday card for Lola · Band logo, final</TabPanel>
      <TabPanel value="flagged">
        <EmptyState>Nothing flagged. Flag a sketch to come back to it here.</EmptyState>
      </TabPanel>
    </Tabs>
  ),
  progress: () => (
    <div className="stack" style={{ gap: 28, maxWidth: 560 }}>
      <Progress label="Syncing offline sketches" value={4} max={10} valueText="4 of 10" />
      <Progress label="Pages inked" value={7} max={9} valueText="7 of 9" tone="mint" />
      <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
    </div>
  ),
  callout: () => (
    <div className="stack" style={{ gap: 18 }}>
      <Callout title="Two friends are on this board">Rosa and Jun are both sketching right now.</Callout>
      <Callout tone="warn" title="Not saved yet">Save your sketch before you close the tab.</Callout>
      <Callout tone="error" title="Couldn’t reach the server">Your sketch is saved on this device.</Callout>
      <Callout tone="success" title="Sketch received">Reference number 24-1187.</Callout>
    </div>
  ),
  toast: () => (
    <div className="stack" style={{ gap: 30 }}>
      <div className="row">
        <Toast kind="success">Sketch posted</Toast>
        <Toast kind="error">Couldn’t send. Saved for later.</Toast>
      </div>
      <div className="row">
        <Button size="sm" variant="mint" onClick={() => toast.success("Sketch posted")}>Show success</Button>
        <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn’t send. Saved for later.")}>Show error</Button>
        <Button size="sm" variant="plain" onClick={() => toast("Rosa liked your sketch")}>Show info</Button>
      </div>
    </div>
  ),
  badges: () => (
    <div className="row">
      <Count label="3 unread">3</Count>
      <Count label="12 queued" tone="ink">12</Count>
      <StatusDot tone="online">Online</StatusDot>
      <StatusDot tone="busy">On a call</StatusDot>
      <StatusDot tone="offline">Offline</StatusDot>
    </div>
  ),
  "sheet-heading": () => (
    <div className="stack" style={{ gap: 40 }}>
      <Heading level={2}>Status timeline</Heading>
      <Sheet tape="periwinkle">A sheet of paper, taped on. Everything inside is printed on paper.</Sheet>
    </div>
  ),
};


/** Renders the demo for a component page. A component (not the lookup object) so it can cross the server/client boundary. */
export function KitDemo({ slug }: { slug: string }) {
  const Demo = DEMOS[slug];
  return Demo ? <Demo /> : null;
}
