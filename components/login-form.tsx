"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";

const MIN_PASSWORD = 6;

export function LoginForm({
  next,
  linkError,
  allowSignUp = true,
  title = "Sign in",
  intro = "Sign in to see and edit your collections.",
}: {
  next: string;
  linkError: string | null;
  allowSignUp?: boolean;
  title?: string;
  intro?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(linkError);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const emailId = useId();
  const passwordId = useId();
  const signingUp = mode === "sign-up";

  function finish() {
    router.replace(next);
    router.refresh();
  }

  function callbackUrl() {
    const url = new URL("/auth/callback", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }

  async function continueWithGoogle() {
    setError(null);
    setPending(true);
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    // On success the browser is already navigating to Google.
    if (oauthError) {
      setPending(false);
      setError(oauthError.message);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const address = email.trim();
    if (signingUp && password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for the password.`);
      return;
    }

    setPending(true);
    const supabase = createClient();

    if (signingUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: address,
        password,
        options: { emailRedirectTo: callbackUrl() },
      });
      setPending(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        finish();
        return;
      }
      if (data.user && data.user.identities?.length === 0) {
        setError("An account with this email already exists. Sign in instead.");
        setMode("sign-in");
        return;
      }
      setSentTo(address);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    setPending(false);
    if (signInError) {
      setError(
        signInError.code === "email_not_confirmed"
          ? "Confirm your email first. The link is in your inbox."
          : signInError.message,
      );
      return;
    }
    finish();
  }

  if (sentTo) {
    return (
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Check your email.</h1>
        <p className="mt-4 leading-relaxed text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{sentTo}</span>. Open it in
          this browser to finish creating your account.
        </p>
        <button
          type="button"
          className="press mt-6 text-sm font-medium text-accent"
          onClick={() => {
            setSentTo(null);
            setMode("sign-in");
            setPassword("");
          }}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">
        {signingUp ? "Create an account" : title}
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        {signingUp ? "An account keeps your collections, on any device." : intro}
      </p>

      <button
        type="button"
        disabled={pending}
        onClick={continueWithGoogle}
        className="press mt-8 flex w-full items-center justify-center gap-2.5 rounded-md border border-line bg-paper-raised px-4 py-2.5 text-sm font-medium hover:border-ink"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or with email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
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
        <div>
          <label htmlFor={passwordId} className="text-sm font-medium">
            Password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            autoComplete={signingUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none"
          />
          {signingUp ? (
            <p className="mt-1.5 text-xs text-muted">
              At least {MIN_PASSWORD} characters.
            </p>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="press w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          {pending
            ? signingUp
              ? "Creating account…"
              : "Signing in…"
            : signingUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      {allowSignUp ? (
      <p className="mt-6 text-sm text-muted">
        {signingUp ? "Already have an account?" : "New to BookNest?"}{" "}
        <button
          type="button"
          className="press font-medium text-accent"
          onClick={() => {
            setMode(signingUp ? "sign-in" : "sign-up");
            setError(null);
          }}
        >
          {signingUp ? "Sign in" : "Create an account"}
        </button>
      </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-4.5 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
