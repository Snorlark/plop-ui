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
    <div className="row" style={{ display: "flex", gap: 80, paddingTop: 90, paddingBottom: 90 }}>
      <Tooltip content="Priority sets who gets paged first.">
        <IconButton variant="plain" size="sm" icon={<InfoIcon size={22} />} label="What does priority do?" />
      </Tooltip>
      <Tooltip content="Autosave runs every 30 seconds. Save now to be sure." open>
        <Button size="sm" variant="mustard">Approx. location</Button>
      </Tooltip>
      <Tooltip content="Sends your live location for 30 minutes." side="right" open>
        <Button size="sm" iconLeft={<PinIcon />}>Pin to board</Button>
      </Tooltip>
      <Tooltip content="Opens below, for triggers in a header." side="bottom" open>
        <Button size="sm" variant="plain">Bottom</Button>
      </Tooltip>
    </div>
  ),
};

export const TextFields: Story = {
  render: () => (
    <Sheet style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 30 }}>
      <TextField label="Artist name" placeholder="e.g. Maria Santos" hint="Optional. Anonymous sketches are fine." />
      <TextField label="Title" error="Give your sketch a title, even a silly one." />
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
      <TicketCard meta="Sketch #1042, 9:14 AM" title="Cat in a teacup, take two" stub="Open">
        <Tag tone="mustard">Medium</Tag>
        <Avatar name="Leo Garcia" size="sm" /> Leo
      </TicketCard>
      <UnitCard name="Jun Reyes" subtitle="Animator, 2 boards open" avatar={<Avatar name="Jun Reyes" status="online" />}>
        <UnitCardRow>
          <Tag status="en-route">In progress</Tag>
          <Eta value={6} unit="min left" />
        </UnitCardRow>
        <UnitCardRow>
          <Button size="sm" iconLeft={<PhoneIcon />}>Call Jun</Button>
          <Button size="sm" variant="plain" iconLeft={<PinIcon />}>Follow</Button>
        </UnitCardRow>
      </UnitCard>
      <StickyNote footer="Added by Ana, 9:06 AM">Try the mint on the button. It's louder, in a good way.</StickyNote>
      <StickyNote tone="pink" footer="Studio note">Print run at 6 PM.</StickyNote>
    </div>
  ),
};

export const TabsStory: Story = {
  name: "Tabs",
  render: () => (
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
};

export const ProgressStory: Story = {
  name: "Progress",
  render: () => (
    <div style={{ display: "grid", gap: 28, maxWidth: 560 }}>
      <Progress label="Syncing offline sketches" value={4} max={10} valueText="4 of 10" />
      <Progress label="Pages inked" value={7} max={9} valueText="7 of 9" tone="mint" />
      <Progress label="Response time target" value={92} valueText="92% used" tone="tomato" solid />
    </div>
  ),
};

export const Callouts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <Callout title="Two friends are on this board">Rosa and Jun are both sketching right now.</Callout>
      <Callout tone="warn" title="Not saved yet">Save your sketch before you close the tab.</Callout>
      <Callout tone="error" title="Couldn’t reach the server" action={<Button size="sm" variant="plain">Try again</Button>}>
        Your sketch is saved on this device.
      </Callout>
      <Callout tone="success" title="Sketch received">Reference number 24-1187.</Callout>
    </div>
  ),
};

export const Toasts: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 30 }}>
      <div style={{ display: "flex", gap: 26 }}>
        <Toast kind="success">Sketch posted</Toast>
        <Toast kind="error">Couldn’t send. Saved for later.</Toast>
        <Toast>Rosa liked your sketch</Toast>
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        <Button size="sm" variant="mint" onClick={() => toast.success("Sketch posted")}>Show success</Button>
        <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn’t send. Saved for later.")}>Show error</Button>
        <Button size="sm" variant="plain" onClick={() => toast("Rosa liked your sketch")}>Show info</Button>
      </div>
    </div>
  ),
};

/** A toast can celebrate or wince when it lands; the wash behind it takes its kind. Press a button to see it. */
export const ToastBursts: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <Button size="sm" variant="mint" onClick={() => toast.success("Saved!", { burst: true, buddy: true })}>Success + confetti</Button>
      <Button size="sm" variant="mustard" onClick={() => toast.success("All done!", { burst: "stars", buddy: "congrats" })}>Success + stars</Button>
      <Button size="sm" variant="tomato" onClick={() => toast.error("Couldn't post", { burst: true, buddy: true })}>Error + poof</Button>
      <Button size="sm" variant="tomato" onClick={() => toast.error("Payment failed", { burst: "zap" })}>Error + zap</Button>
      <Button size="sm" variant="plain" onClick={() => toast("New version ready", { burst: true })}>Info + sparkle</Button>
    </div>
  ),
};

/** What shows behind a live toast: set with PlopProvider `toastBackdrop`. Press a button to see it. */
const backdropStory = (backdrop: "dots" | "solid" | "none"): Story => ({
  parameters: { toastBackdrop: backdrop },
  render: () => (
    <div style={{ display: "flex", gap: 22 }}>
      <Button size="sm" variant="mint" onClick={() => toast.success("Copied to clipboard!", { buddy: true })}>Show a toast</Button>
      <Button size="sm" variant="plain" onClick={() => toast("Rosa liked your sketch")}>Show one without a buddy</Button>
    </div>
  ),
});
export const ToastBackdropDots = backdropStory("dots");
export const ToastBackdropSolid = backdropStory("solid");
export const ToastBackdropNone = backdropStory("none");

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
      <Heading level={1}>Sketchbook</Heading>
      <Heading level={2}>Status timeline</Heading>
      <Heading level={3}>Notify me when</Heading>
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
