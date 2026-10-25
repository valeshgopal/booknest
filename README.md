# BookNest

A Next.js catalog for browsing books and saving them to collections. Books, accounts, and collections are stored in Supabase.

Copy `.env.example` to `.env.local` and add your project URL, publishable key, and secret key.

```bash
npm run dev
npm run build
npm run lint
```

## Rendering

| Route | Strategy | Why |
| --- | --- | --- |
| `/` | Cached (1 hour) | The catalog is the same for every visitor and changes rarely |
| `/books` | Cached page, client filters | Supabase is read on the server. Search stays in the browser |
| `/books/[slug]` | Cached, prerendered from the table | Known books are generated at build time. A new slug is rendered on demand |
| `/genres/[slug]` | Cached, one page per genre | The genre list is fixed. Membership comes from Supabase |
| `/login` | Dynamic | Signed-in visitors are sent on to `next` |
| `/auth/callback` | Route handler | Finishes email confirmation and sets the session cookie |
| `/collections` | Dynamic, signed in only | Per-user data. Rows are read on the client through RLS |
| `/collections/[id]` | Dynamic, signed in only | RLS hides collections owned by anyone else |
| `/profile` | Dynamic, signed in only | Edit display name and profile picture |
| `/account` | Dynamic, signed in only | Account details and account deletion |

Auth state is never read in the root layout, so the catalog pages stay cached. The header and the "Save" buttons pick up the session on the client.

## Auth

- Google sign-in and email/password via Supabase Auth. Both finish at `/auth/callback`, which exchanges the code for a session cookie.
- Google needs an OAuth client (type "Web application") in Google Cloud Console with the authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`. Put its client ID and secret under Authentication → Sign In / Providers → Google in Supabase.
- Deleting an account runs as a server action with `SUPABASE_SECRET_KEY` (server-only, never `NEXT_PUBLIC_`). It removes the user's avatar files, then the auth user, which cascades to their profile and collections.
- On the main host, `middleware.ts` runs only on `/collections/*`, `/profile`, `/account`, and `/login`. It refreshes the session cookie and redirects signed-out visitors to `/login?next=…`. The pages check `getClaims()` again on the server.
## Admin dashboard

The same app serves the admin dashboard on the `admin.` subdomain. Locally that is [admin.localhost:3000](http://admin.localhost:3000).

- `middleware.ts` rewrites every admin-host request to `app/admin/*`. `/auth/*` is shared by both hosts. On the main host, `/admin` returns 404.
- Only emails in `public.admins` get in. That is `valesh.dev@gmail.com` for now. To add someone, insert their lowercase email into that table.
- The admin can add, edit, and delete books. The database enforces the same list: the "Admins can add/update/delete books" policies only accept a JWT whose verified email is in `public.admins`.
- Changing a slug carries over into reader collections, and deleting a book removes it from them (`ON UPDATE/DELETE CASCADE`). Old `/books/<slug>` links stop working after a slug change.
- Every change invalidates the catalog cache, so the public pages update on their next request.
- Production setup: point `admin.<your-domain>` at the same deployment, and add `https://admin.<your-domain>/**` to the Supabase redirect allow list. Sessions are per host, so the admin signs in separately on the subdomain.

## Database

Migrations live in `supabase/migrations`.

- `books`: public catalog. Everyone can read it; only admins can change it.
- `collections`: one row per collection, owned by `user_id`. A user can have any number.
- `collection_books`: which books are in which collection.
- `profiles`: optional display name and avatar per user. Without a row, the app uses the name and picture from Google, then the email.
- `admins`: the admin allow-list. Each user can read only their own row, if they have one.
- Storage bucket `avatars`: public to view, writable only in the owner's `<user id>/` folder. Max 2 MB, images only.

RLS is on for every table. `collections`, `collection_books`, and `profiles` are limited to their owner, and signed-out visitors can't read them at all.

## Setup

1. Apply the migrations with the Supabase CLI: `supabase link --project-ref <ref>`, then `supabase db push`.
2. In Authentication → URL Configuration, add `http://localhost:3000/**` and `http://admin.localhost:3000/**` to the redirect allow list, plus the production URLs.
3. Enable Google under Authentication → Sign In / Providers, as described above.
