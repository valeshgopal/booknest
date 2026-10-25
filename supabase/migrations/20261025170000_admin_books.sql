-- Admin allow-list and admin-only book inserts.
-- Admin status comes from the verified email in the user's JWT. Email sign-up
-- requires confirmation and Google emails are verified, so a JWT can only carry
-- an address its owner controls.

create table public.admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admins_email_lowercase check (email = lower(email))
);

alter table public.admins enable row level security;

revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- A user can see only their own row, which is how the app and the books
-- policy below ask "am I an admin?" without SECURITY DEFINER.
create policy "Admins can see their own admin row"
  on public.admins
  for select
  to authenticated
  using (email = lower((select auth.jwt() ->> 'email')));

insert into public.admins (email) values ('valesh.dev@gmail.com');

alter table public.books
  add constraint books_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  add constraint books_cover_shape
    check (
      cover is null
      or (
        jsonb_typeof(cover) = 'object'
        and cover ?& array['background', 'foreground', 'spine']
      )
    );

grant insert on public.books to authenticated;
grant usage on sequence public.books_sort_order_seq to authenticated;

create policy "Admins can add books"
  on public.books
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admins a
      where a.email = lower((select auth.jwt() ->> 'email'))
    )
  );
