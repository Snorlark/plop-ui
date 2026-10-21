"use client";

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
import type { ReactNode } from "react";

/** Live demos for the generic component pages (app/docs/components/[slug]). */
const DEMOS: Record<string, () => ReactNode> = {
  tooltip: () => (
    <div className="row" style={{ paddingTop: 80, justifyContent: "space-around" }}>
      <Tooltip content="Priority sets who gets paged first.">
        <IconButton variant="plain" size="sm" icon={<InfoIcon size={22} />} label="What does priority do?" burst={false} />
      </Tooltip>
      <Tooltip content="Sends your live location for 30 minutes." side="right" open>
        <Button size="sm" iconLeft={<PinIcon />}>Share pin</Button>
      </Tooltip>
    </div>
  ),
  "text-field": () => (
    <div className="fields">
      <TextField label="Caller name" placeholder="e.g. Maria Santos" hint="Optional. Anonymous reports are fine." />
      <TextField label="Location" error="Add a street, barangay, or landmark so responders can find it." />
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
      <TicketCard meta="Ticket #1042, 9:14 AM" title="Printer on 3F jams on every second page" stub="Open">
        <Tag tone="mustard" tilt={-2}>Medium</Tag>
      </TicketCard>
      <UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes, 2 riders" avatar={<Avatar name="Jun Reyes" status="online" />}>
        <UnitCardRow>
          <Tag status="en-route" tilt={-2}>En route</Tag>
          <Eta value={6} unit="min away" />
        </UnitCardRow>
        <UnitCardRow>
          <Button size="sm" iconLeft={<PhoneIcon />}>Call unit</Button>
        </UnitCardRow>
      </UnitCard>
      <StickyNote footer="Added by dispatcher Ana, 9:06 AM">Caller says the front gate is locked. Use the side entrance.</StickyNote>
    </div>
  ),
  tabs: () => (
    <Tabs defaultValue="active">
      <TabList label="Incident queue">
        <Tab value="active" badge={<Count label="3 active" size="sm">3</Count>}>Active</Tab>
        <Tab value="resolved">Resolved</Tab>
        <Tab value="flagged">Flagged</Tab>
      </TabList>
      <TabPanel value="active">Flooding, Purok 4 · Road accident, Maharlika Hwy · Noise complaint, Brgy. 3</TabPanel>
      <TabPanel value="resolved">Lost child, town plaza · Power line down, Brgy. 7</TabPanel>
      <TabPanel value="flagged">
        <EmptyState>Nothing flagged. Flag an incident to follow up on it here.</EmptyState>
      </TabPanel>
    </Tabs>
  ),
  progress: () => (
    <div className="stack" style={{ gap: 28, maxWidth: 560 }}>
      <Progress label="Syncing offline reports" value={4} max={10} valueText="4 of 10" />
      <Progress label="Units available" value={7} max={9} valueText="7 of 9" tone="mint" />
      <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
    </div>
  ),
  callout: () => (
    <div className="stack" style={{ gap: 18 }}>
      <Callout title="Two responders are near this pin">Mobile 2 and Mobile 5 are both within 2 km.</Callout>
      <Callout tone="warn" title="Location is approximate">Confirm a landmark before dispatching.</Callout>
      <Callout tone="error" title="Couldn’t reach the station">Your report is saved on this phone.</Callout>
      <Callout tone="success" title="Report received">Reference number 24-1187.</Callout>
    </div>
  ),
  toast: () => (
    <div className="stack" style={{ gap: 30 }}>
      <div className="row">
        <Toast kind="success">Report sent</Toast>
        <Toast kind="error">Couldn’t send. Saved for later.</Toast>
      </div>
      <div className="row">
        <Button size="sm" variant="mint" onClick={() => toast.success("Report sent")}>Show success</Button>
        <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn’t send. Saved for later.")}>Show error</Button>
        <Button size="sm" variant="plain" onClick={() => toast("Mobile 2 is 6 min away")}>Show info</Button>
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
