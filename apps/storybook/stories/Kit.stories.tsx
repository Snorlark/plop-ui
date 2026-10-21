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
import type { Meta, StoryObj } from "@storybook/react";

const meta = { title: "Kit" } satisfies Meta;
export default meta;
type Story = StoryObj;

export const TooltipStory: Story = {
  name: "Tooltip",
  render: () => (
    <div className="row" style={{ display: "flex", gap: 80, paddingTop: 90 }}>
      <Tooltip content="Priority sets who gets paged first.">
        <IconButton variant="plain" size="sm" icon={<InfoIcon size={22} />} label="What does priority do?" />
      </Tooltip>
      <Tooltip content="GPS accuracy is ±200 m. Ask the caller for a landmark." open>
        <Button size="sm" variant="mustard">Approx. location</Button>
      </Tooltip>
      <Tooltip content="Sends your live location for 30 minutes." side="right" open>
        <Button size="sm" iconLeft={<PinIcon />}>Share pin</Button>
      </Tooltip>
    </div>
  ),
};

export const TextFields: Story = {
  render: () => (
    <Sheet style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 30 }}>
      <TextField label="Caller name" placeholder="e.g. Maria Santos" hint="Optional. Anonymous reports are fine." />
      <TextField label="Location" error="Add a street, barangay, or landmark so responders can find it." />
      <TextField label="Callback number" defaultValue="0917 555 0142" success hint="Looks good." />
      <TextField label="Disabled" disabled defaultValue="Read only" />
      <TextArea label="What happened?" placeholder="Write it like you’d say it on the phone." style={{ gridColumn: "1 / -1" }} />
    </Sheet>
  ),
};

export const Radios: Story = {
  render: () => (
    <RadioGroup legend="Priority" defaultValue="medium">
      <Radio value="low">Low</Radio>
      <Radio value="medium" dotColor="var(--plop-mustard)">Medium</Radio>
      <Radio value="high" dotColor="var(--plop-tomato)">High, page everyone</Radio>
      <Radio value="none" disabled>Not set</Radio>
    </RadioGroup>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
      <Avatar name="Rosa Santos" size="xl" />
      <Avatar name="Rosa Santos" size="lg" />
      <Avatar name="Jun Reyes" status="online" />
      <Avatar name="Ana Cruz" status="busy" statusLabel="on a call" />
      <Avatar name="Leo Garcia" status="offline" size="sm" />
      <AvatarStack names={["Rosa Santos", "Jun Reyes", "Ana Cruz", "Mika Tan", "Ben Ocampo", "Paolo Lim", "Carla Diaz"]} />
    </div>
  ),
};

export const Cards: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 36, alignItems: "start" }}>
      <TicketCard meta="Ticket #1042, 9:14 AM" title="Printer on 3F jams on every second page" stub="Open">
        <Tag tone="mustard">Medium</Tag>
        <Avatar name="Leo Garcia" size="sm" /> Leo
      </TicketCard>
      <UnitCard name="Mobile 2" subtitle="PO2 Jun Reyes, 2 riders" avatar={<Avatar name="Jun Reyes" status="online" />}>
        <UnitCardRow>
          <Tag status="en-route">En route</Tag>
          <Eta value={6} unit="min away" />
        </UnitCardRow>
        <UnitCardRow>
          <Button size="sm" iconLeft={<PhoneIcon />}>Call unit</Button>
          <Button size="sm" variant="plain" iconLeft={<PinIcon />}>Track</Button>
        </UnitCardRow>
      </UnitCard>
      <StickyNote footer="Added by dispatcher Ana, 9:06 AM">Caller says the front gate is locked. Use the side entrance by the sari-sari store.</StickyNote>
      <StickyNote tone="pink" footer="Shift note">Generator check at 6 PM.</StickyNote>
    </div>
  ),
};

export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
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
};

export const ProgressStory: Story = {
  name: "Progress",
  render: () => (
    <div style={{ display: "grid", gap: 28, maxWidth: 560 }}>
      <Progress label="Syncing offline reports" value={4} max={10} valueText="4 of 10" />
      <Progress label="Units available" value={7} max={9} valueText="7 of 9" tone="mint" />
      <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
    </div>
  ),
};

export const Callouts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <Callout title="Two responders are near this pin">Mobile 2 and Mobile 5 are both within 2 km.</Callout>
      <Callout tone="warn" title="Location is approximate">Confirm a landmark before dispatching.</Callout>
      <Callout tone="error" title="Couldn’t reach the station" action={<Button size="sm" variant="plain">Try again</Button>}>
        Your report is saved on this phone.
      </Callout>
      <Callout tone="success" title="Report received">Reference number 24-1187.</Callout>
    </div>
  ),
};

export const Toasts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 30 }}>
      <div style={{ display: "flex", gap: 26 }}>
        <Toast kind="success">Report sent</Toast>
        <Toast kind="error">Couldn’t send. Saved for later.</Toast>
        <Toast>Mobile 2 is 6 min away</Toast>
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        <Button size="sm" variant="mint" onClick={() => toast.success("Report sent")}>Show success</Button>
        <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn’t send. Saved for later.")}>Show error</Button>
        <Button size="sm" variant="plain" onClick={() => toast("Mobile 2 is 6 min away")}>Show info</Button>
      </div>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
      <Count label="3 unread">3</Count>
      <Count label="12 queued" tone="ink">12</Count>
      <StatusDot tone="online">Online</StatusDot>
      <StatusDot tone="busy">On a call</StatusDot>
      <StatusDot tone="offline">Offline</StatusDot>
    </div>
  ),
};

export const Headings: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 30 }}>
      <Heading level={1}>Dispatch</Heading>
      <Heading level={2}>Status timeline</Heading>
      <Heading level={3}>Notify on dispatch</Heading>
    </div>
  ),
};

export const Sheets: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40 }}>
      <Sheet>Mustard tape (default)</Sheet>
      <Sheet tape="periwinkle" tilt={0.35}>Periwinkle tape, slightly tilted</Sheet>
      <Sheet tape="bubblegum" tilt={-0.4}>Bubblegum tape</Sheet>
      <Sheet tape="none">No tape</Sheet>
    </div>
  ),
};

export const InkBurst: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 30 }}>
      <Button>Press for confetti</Button>
      <Button variant="tomato">Tomato burst</Button>
      <Button variant="mint">Mint burst</Button>
      <Button variant="plain" burst={false}>No burst</Button>
    </div>
  ),
};
