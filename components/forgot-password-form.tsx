"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { MailIcon } from "@/components/confirm-email";
import {
  EMAIL_COOLDOWN_SECONDS,
  isEmailRateLimit,
  recoveryCallbackUrl,
} from "@/lib/auth-links";
import { createClient } from "@/lib/supabase/client";
import { useCooldown } from "@/lib/use-cooldown";

export function ForgotPasswordForm({
  next,
  initialEmail,
  linkError,
}: {
  next: string;
  initialEmail: string;
  linkError: string | null;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(linkError);
  const [cooldown, setCooldown] = useCooldown();
  const emailId = useId();
  const loginHref = `/login?${new URLSearchParams({ next })}`;

  async function send(address: string) {
    setError(null);
    setPending(true);
    const { error: sendError } = await createClient().auth.resetPasswordForEmail(
      address,
      { redirectTo: recoveryCallbackUrl(window.location.origin, next) },
    );
    setPending(false);

    if (sendError) {
      if (isEmailRateLimit(sendError)) {
        setError("Too many emails sent. Wait a minute, then try again.");
        setCooldown(EMAIL_COOLDOWN_SECONDS);
      } else {
        setError(sendError.message);
      }
      return;
    }
    setSentTo(address);
    setCooldown(EMAIL_COOLDOWN_SECONDS);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(email.trim());
  }

  if (sentTo) {
    return (
      <div>
        <MailIcon />
        <h1 className="mt-6 font-serif text-4xl tracking-tight">Check your email</h1>
        <p className="mt-4 leading-relaxed text-muted">
          If an account exists for{" "}
          <span className="font-medium break-all text-ink">{sentTo}</span>, we sent
          it a link to choose a new password. Open it in this browser.
        </p>

        <div className="mt-8 rounded-lg border border-line bg-paper-raised p-4">
          <p className="text-sm font-medium">Didn’t get it?</p>
          <p className="mt-1 text-sm text-muted">
            Check your spam folder, or send the link again.
          </p>
          <button
            type="button"
            disabled={pending || cooldown > 0}
            onClick={() => send(sentTo)}
            className="press mt-3 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
          >
            {pending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <p aria-live="polite" className="mt-2 text-sm text-accent">
            {error}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setError(null);
            }}
            className="press font-medium text-accent"
          >
            Use a different email
          </button>
          <Link href={loginHref} className="font-medium text-muted hover:text-ink">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Forgot your password?</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Enter the email you signed up with and we’ll send you a link to choose a new
        one.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor={emailId} className="text-sm font-medium">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none"
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || cooldown > 0}
          className="press w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Sending…" : cooldown > 0 ? `Try again in ${cooldown}s` : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Remembered it?{" "}
        <Link href={loginHref} className="font-medium text-accent">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
