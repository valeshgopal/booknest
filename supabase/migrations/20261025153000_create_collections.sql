-- Per-user collections. Each user can own many collections; each collection holds many books.

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint collections_name_not_blank check (btrim(name) <> ''),
  constraint collections_name_length check (char_length(name) <= 48),
  constraint collections_description_length check (char_length(description) <= 140)
);

create index collections_user_id_created_at_idx
  on public.collections (user_id, created_at desc);

create table public.collection_books (
  collection_id uuid not null references public.collections (id) on delete cascade,
  book_slug text not null references public.books (slug) on update cascade on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, book_slug)
);

create index collection_books_book_slug_idx
  on public.collection_books (book_slug);

alter table public.collections enable row level security;
alter table public.collection_books enable row level security;

revoke all on public.collections from anon;
revoke all on public.collection_books from anon;
grant select, insert, update, delete on public.collections to authenticated;
grant select, insert, delete on public.collection_books to authenticated;

create policy "Users can read their collections"
  on public.collections
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their collections"
  on public.collections
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their collections"
  on public.collections
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their collections"
  on public.collections
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read books in their collections"
  on public.collection_books
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.user_id = (select auth.uid())
    )
  );

create policy "Users can add books to their collections"
  on public.collection_books
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.user_id = (select auth.uid())
    )
  );

create policy "Users can remove books from their collections"
  on public.collection_books
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.collections c
      where c.id = collection_id
        and c.user_id = (select auth.uid())
    )
  );
