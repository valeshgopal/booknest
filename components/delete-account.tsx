"use client";

import { useId, useState, useTransition } from "react";
import { deleteAccount } from "@/app/(site)/account/actions";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = useId();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(typed);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await createClient().auth.signOut({ scope: "local" });
      window.location.assign("/");
    });
  }

  return (
    <section className="mt-14 rounded-lg border border-accent/40 p-5 sm:p-6">
      <h2 className="font-serif text-2xl tracking-tight">Delete account</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        This permanently deletes your account, your profile, and every
        collection you’ve made. It can’t be undone.
      </p>

      {confirming ? (
        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label htmlFor={inputId} className="block text-sm font-medium">
            Type <span className="font-mono">DELETE</span> to confirm
          </label>
          <input
            id={inputId}
            value={typed}
            autoComplete="off"
            autoFocus
            onChange={(event) => setTyped(event.target.value)}
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none sm:max-w-xs"
          />
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending || typed.trim() !== "DELETE"}
              className="press rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete my account"}
            </button>
            <button
              type="button"
              disabled={pending}
              className="press rounded-md border border-line px-4 py-2.5 text-sm font-medium"
              onClick={() => {
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="press mt-5 rounded-md border border-accent/50 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent hover:text-white"
          onClick={() => setConfirming(true)}
        >
          Delete account…
        </button>
      )}
    </section>
  );
}
