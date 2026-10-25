import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  await requireUser("/profile");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Profile
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Your name and picture appear in the navigation bar.
        </p>
      </header>
      <ProfileForm />
    </div>
  );
}
