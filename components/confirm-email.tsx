"use client";

import Link from "next/link";
import { useState } from "react";
import {
  EMAIL_COOLDOWN_SECONDS,
  isEmailRateLimit,
  signupCallbackUrl,
} from "@/lib/auth-links";
import { createClient } from "@/lib/supabase/client";
import { useCooldown } from "@/lib/use-cooldown";

export function ConfirmEmail({
  email,
  next,
  justSent,
}: {
  email: string;
  next: string;
  justSent: boolean;
}) {
  const [cooldown, setCooldown] = useCooldown(justSent ? EMAIL_COOLDOWN_SECONDS : 0);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: "sent" | "error"; text: string } | null>(
    null,
  );

  async function resend() {
    setPending(true);
    setStatus(null);
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: signupCallbackUrl(window.location.origin, next) },
    });
    setPending(false);

    if (error) {
      const rateLimited = isEmailRateLimit(error);
      setStatus({
        kind: "error",
        text: rateLimited
          ? "Too many emails sent. Wait a minute, then try again."
          : error.message,
      });
      if (rateLimited) setCooldown(EMAIL_COOLDOWN_SECONDS);
      return;
    }
    setStatus({ kind: "sent", text: `Sent a new link to ${email}.` });
    setCooldown(EMAIL_COOLDOWN_SECONDS);
  }

  const loginHref = (mode?: "signup") => {
    const params = new URLSearchParams({ next });
    if (mode) params.set("mode", mode);
    return `/login?${params}`;
  };

  return (
    <div>
      <MailIcon />
      <h1 className="mt-6 font-serif text-4xl tracking-tight">Check your email</h1>
      <p className="mt-4 leading-relaxed text-muted">
        {justSent ? "We sent a confirmation link to " : "Your account isn’t confirmed yet. The link went to "}
        <span className="font-medium break-all text-ink">{email}</span>. Open it
        in this browser to finish creating your account.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Collections, your profile, and other account features unlock once your
        email is confirmed.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-paper-raised p-4">
        <p className="text-sm font-medium">Didn’t get it?</p>
        <p className="mt-1 text-sm text-muted">
          Check your spam folder, or send the link again.
        </p>
        <button
          type="button"
          disabled={pending || cooldown > 0}
          onClick={resend}
          className="press mt-3 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
        >
          {pending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend email"}
        </button>
        <p
          aria-live="polite"
          className={`mt-2 text-sm ${status?.kind === "error" ? "text-accent" : "text-muted"}`}
        >
          {status?.text}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={loginHref("signup")} className="font-medium text-accent">
          Use a different email
        </Link>
        <Link href={loginHref()} className="font-medium text-muted hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export function MailIcon() {
  return (
    <span
      aria-hidden
      className="grid size-12 place-items-center rounded-full bg-moss-soft text-moss"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
