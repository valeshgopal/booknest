-- Wrap auth.jwt() in a subselect so Postgres evaluates it once per statement
-- instead of once per row.

drop policy "Admins can see their own admin row" on public.admins;
create policy "Admins can see their own admin row"
  on public.admins
  for select
  to authenticated
  using (email = lower((select auth.jwt()) ->> 'email'));

drop policy "Admins can add books" on public.books;
create policy "Admins can add books"
  on public.books
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admins a
      where a.email = lower((select auth.jwt()) ->> 'email')
    )
  );
