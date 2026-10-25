"use client";

import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { Avatar } from "@/components/avatar";
import {
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  DISPLAY_NAME_MAX,
  avatarPathFromUrl,
} from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm() {
  const { ready, user } = useAuth();

  if (!ready || !user) {
    return (
      <div aria-hidden className="mt-10 space-y-6">
        <div className="size-24 rounded-full bg-line" />
        <div className="h-11 rounded-md bg-line" />
      </div>
    );
  }

  return (
    <ProfileFields
      key={user.id}
      userId={user.id}
      initialName={user.name}
      currentAvatar={user.avatarUrl}
    />
  );
}

function ProfileFields({
  userId,
  initialName,
  currentAvatar,
}: {
  userId: string;
  initialName: string;
  currentAvatar: string | null;
}) {
  const { applyProfile } = useAuth();
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const nameId = useId();
  const fileId = useId();

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownAvatar = file ? preview : removePhoto ? null : currentAvatar;
  const dirty =
    name.trim() !== initialName || file !== null || (removePhoto && currentAvatar !== null);

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    setSaved(false);
    if (!AVATAR_TYPES[picked.type]) {
      setError("Use a PNG, JPEG, WebP, or GIF image.");
      return;
    }
    if (picked.size > AVATAR_MAX_BYTES) {
      setError("That image is over 2 MB. Pick a smaller one.");
      return;
    }
    setError(null);
    setRemovePhoto(false);
    setFile(picked);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = name.trim();
    if (!displayName) {
      setError("Your name can’t be empty.");
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const storage = supabase.storage.from(AVATAR_BUCKET);

    let avatarUrl = removePhoto ? null : currentAvatar;
    let uploadedPath: string | null = null;

    if (file) {
      uploadedPath = `${userId}/${crypto.randomUUID()}.${AVATAR_TYPES[file.type]}`;
      const { error: uploadError } = await storage.upload(uploadedPath, file, {
        contentType: file.type,
        cacheControl: "31536000",
      });
      if (uploadError) {
        setPending(false);
        setError(uploadError.message);
        return;
      }
      avatarUrl = storage.getPublicUrl(uploadedPath).data.publicUrl;
    }

    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .select("display_name, avatar_url")
      .single();

    if (saveError || !data) {
      if (uploadedPath) await storage.remove([uploadedPath]);
      setPending(false);
      setError(saveError?.message ?? "Could not save your profile.");
      return;
    }

    const previousPath = avatarPathFromUrl(currentAvatar);
    if (previousPath && avatarUrl !== currentAvatar) {
      await storage.remove([previousPath]);
    }

    applyProfile(data);
    setName(data.display_name ?? displayName);
    setFile(null);
    setRemovePhoto(false);
    setPending(false);
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="mt-10 space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={name.trim() || initialName} url={shownAvatar} size={96} />
        <div>
          <p className="text-sm font-medium">Profile picture</p>
          <p className="mt-1 text-sm text-muted">PNG, JPEG, WebP, or GIF, up to 2 MB.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label
              htmlFor={fileId}
              className="press cursor-pointer rounded-md border border-line bg-paper-raised px-3 py-2 text-sm font-medium hover:border-ink has-[:focus-visible]:border-ink"
            >
              {shownAvatar ? "Change photo" : "Upload photo"}
              <input
                id={fileId}
                type="file"
                accept={Object.keys(AVATAR_TYPES).join(",")}
                onChange={pickFile}
                className="sr-only"
              />
            </label>
            {shownAvatar ? (
              <button
                type="button"
                className="press rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-ink"
                onClick={() => {
                  setFile(null);
                  setRemovePhoto(true);
                  setSaved(false);
                }}
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={nameId} className="text-sm font-medium">
          Name
        </label>
        <input
          id={nameId}
          value={name}
          maxLength={DISPLAY_NAME_MAX}
          autoComplete="name"
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
            if (error) setError(null);
          }}
          className="mt-1.5 w-full rounded-md border border-line bg-paper-raised px-3 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="press rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <p aria-live="polite" className="text-sm">
          {error ? (
            <span className="text-accent">{error}</span>
          ) : saved ? (
            <span className="text-muted">Profile saved.</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
