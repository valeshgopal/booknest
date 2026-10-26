"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { resetPassword } from "@/app/(site)/reset-password/actions";
import { PasswordInput } from "@/components/password-input";
import { MIN_PASSWORD_LENGTH, forgotPasswordPath } from "@/lib/auth-links";

export function ResetPasswordForm({
  next,
  email,
}: {
  next: string;
  email: string | null;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const passwordId = useId();
  const confirmId = useId();
  const mismatch = confirmTouched && confirmPassword !== password;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for the password.`);
      return;
    }
    if (confirmPassword !== password) {
      setConfirmTouched(true);
      document.getElementById(confirmId)?.focus();
      return;
    }

    setPending(true);
    const result = await resetPassword(password, confirmPassword);
    if ("error" in result) {
      setPending(false);
      setError(result.error);
      setExpired(Boolean(result.expired));
      return;
    }
    const destination = new URL(next, window.location.origin);
    destination.searchParams.set("reset", "1");
    // A full load, so the layout's one-time notice reads the flag on mount.
    window.location.replace(destination);
  }

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Choose a new password</h1>
      <p className="mt-3 leading-relaxed text-muted">
        {email ? (
          <>
            For <span className="font-medium break-all text-ink">{email}</span>.{" "}
          </>
        ) : null}
        You’ll stay signed in on this device.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label htmlFor={passwordId} className="text-sm font-medium">
            New password
          </label>
          <PasswordInput
            id={passwordId}
            label="New password"
            required
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none"
          />
          <p className="mt-1.5 text-xs text-muted">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>
        <div>
          <label htmlFor={confirmId} className="text-sm font-medium">
            Confirm new password
          </label>
          <PasswordInput
            id={confirmId}
            label="Confirm new password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            aria-invalid={mismatch}
            aria-describedby={mismatch ? `${confirmId}-error` : undefined}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() => {
              if (confirmPassword) setConfirmTouched(true);
            }}
            className="rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none aria-[invalid=true]:border-accent"
          />
          {mismatch ? (
            <p id={`${confirmId}-error`} className="mt-1.5 text-xs text-accent">
              Passwords don’t match.
            </p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}{" "}
            {expired ? (
              <Link
                href={forgotPasswordPath(next, email ?? undefined)}
                className="font-medium underline"
              >
                Send a new link
              </Link>
            ) : null}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="press w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {pending ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
