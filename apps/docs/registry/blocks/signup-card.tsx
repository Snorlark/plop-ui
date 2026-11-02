"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Button, Checkbox, Heading, Sheet, TextField, toast } from "@plop-ui/react";

type Errors = Partial<Record<"name" | "email" | "password" | "terms", string>>;

/** A sign-up card: name, email and password with friendly errors on submit, a terms checkbox, and a celebration when it works. */
export function SignupCard() {
  const [errors, setErrors] = useState<Errors>({});
  const [terms, setTerms] = useState(false);
  const [sending, setSending] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next: Errors = {};
    if (!name) next.name = "What should we call you?";
    if (!email.includes("@")) next.email = "That doesn't look like an email.";
    if (password.length < 8) next.password = "At least 8 characters, please.";
    if (!terms) next.terms = "Please agree to the terms.";
    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("A few things need fixing", { buddy: true });
      return;
    }
    setSending(true);
    // Replace with your own sign-up call.
    setTimeout(() => {
      setSending(false);
      toast.success(`Welcome, ${name}!`, { buddy: "congrats", burst: true });
    }, 900);
  }

  return (
    <Sheet tape="mint">
      <form onSubmit={submit} noValidate style={stack}>
        <div>
          <Heading level={2}>Join the sketchbook</Heading>
          <p style={sub}>Free forever. Bring your own doodles.</p>
        </div>
        <TextField label="Name" name="name" autoComplete="name" error={errors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password}
        />
        <div>
          <Checkbox checked={terms} onCheckedChange={setTerms}>
            I agree to the terms
          </Checkbox>
          {errors.terms && (
            <p role="alert" style={error}>
              {errors.terms}
            </p>
          )}
        </div>
        {/* The buddy peeks about 30px above the button, so it gets room of its own. */}
        <div style={{ paddingTop: 34 }}>
          <Button type="submit" variant="ink" size="lg" buddy loading={sending} loadingLabel="Creating your account">
            Create account
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

const stack: CSSProperties = { display: "grid", gap: 18, maxWidth: 400 };
const sub: CSSProperties = { margin: "6px 0 0", color: "var(--plop-ink-soft)" };
const error: CSSProperties = { margin: "6px 0 0", color: "var(--plop-tomato-text)", fontSize: 15 };
