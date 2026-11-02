"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Button, Heading, Select, Sheet, Switch, TextField, toast } from "@plop-ui/react";

/** A settings sheet: profile fields, notification switches, a paper picker, and a Save button that toasts with a buddy. */
export function SettingsPanel() {
  const [name, setName] = useState("Rosa Santos");
  const [email, setEmail] = useState("rosa@example.com");
  const [replies, setReplies] = useState(true);
  const [digest, setDigest] = useState(false);
  const [paper, setPaper] = useState("poster");
  const [saving, setSaving] = useState(false);
  const emailError = email.includes("@") ? undefined : "That doesn't look like an email.";

  function save(e: FormEvent) {
    e.preventDefault();
    if (emailError) return;
    setSaving(true);
    // Replace with your own save call.
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved", { buddy: true });
    }, 800);
  }

  return (
    <Sheet tape="mustard">
      <form onSubmit={save} noValidate style={stack}>
        <Heading level={2}>Settings</Heading>

        <fieldset style={group}>
          <legend style={legend}>Profile</legend>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            error={emailError}
          />
        </fieldset>

        <fieldset style={group}>
          <legend style={legend}>Notifications</legend>
          <Switch checked={replies} onCheckedChange={setReplies}>
            Email me when someone replies
          </Switch>
          <Switch checked={digest} onCheckedChange={setDigest} color="ink">
            Weekly digest
          </Switch>
        </fieldset>

        <Select
          label="Paper"
          hint="Pass it to your <PlopProvider surface>."
          value={paper}
          onValueChange={setPaper}
          options={[
            { value: "poster", label: "Poster" },
            { value: "notebook", label: "Notebook" },
            { value: "kraft", label: "Kraft" },
            { value: "riso", label: "Riso" },
            { value: "mat", label: "Cutting mat" },
          ]}
        />

        <div style={row}>
          <Button type="submit" variant="ink" loading={saving} loadingLabel="Saving">
            Save changes
          </Button>
          <Button type="reset" variant="plain">
            Cancel
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

const stack: CSSProperties = { display: "grid", gap: 24, maxWidth: 440 };
const group: CSSProperties = { display: "grid", gap: 16, margin: 0, padding: 0, border: 0 };
const legend: CSSProperties = { marginBottom: 8, fontFamily: "var(--plop-font-letter)", fontStyle: "italic", fontWeight: 700, textTransform: "uppercase", color: "var(--plop-ink)" };
const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 16, paddingTop: 8 };
