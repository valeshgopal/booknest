-- Admins can edit and delete books. Same allow-list check as inserts.
-- collection_books references books(slug) with ON UPDATE/DELETE CASCADE, so a
-- renamed slug follows into reader collections and a deleted book leaves them.

grant update, delete on public.books to authenticated;

create policy "Admins can update books"
  on public.books
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where a.email = lower((select auth.jwt()) ->> 'email')
    )
  )
  with check (
    exists (
      select 1
      from public.admins a
      where a.email = lower((select auth.jwt()) ->> 'email')
    )
  );

create policy "Admins can delete books"
  on public.books
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admins a
      where a.email = lower((select auth.jwt()) ->> 'email')
    )
  );
