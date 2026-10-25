import { redirect } from "next/navigation";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { getAdminState } from "@/lib/admin";

// Page-level gate. The database enforces the same allow-list on writes.
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const state = await getAdminState();

  if (state.status === "signed-out") redirect("/login");

  if (state.status === "forbidden") {
    return (
      <div className="mx-auto w-full max-w-lg px-5 py-20 sm:px-6">
        <h1 className="font-serif text-4xl tracking-tight">No admin access.</h1>
        <p className="mt-4 leading-relaxed text-muted">
          {state.email ? (
            <>
              <span className="font-medium text-ink">{state.email}</span> isn’t
              allowed to use the admin dashboard.
            </>
          ) : (
            "This account isn’t allowed to use the admin dashboard."
          )}{" "}
          Sign out and use the administrator account.
        </p>
        <div className="mt-6">
          <AdminSignOut />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
