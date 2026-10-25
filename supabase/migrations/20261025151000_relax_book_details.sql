-- Only slug, title, and author are required to show a book.
-- A book without a cover renders the "No cover available" image on the frontend.
alter table public.books
  alter column year drop not null,
  alter column pages drop not null,
  alter column genre drop not null,
  alter column blurb drop not null,
  alter column cover drop not null;

alter table public.books
  add constraint books_title_not_blank check (btrim(title) <> ''),
  add constraint books_author_not_blank check (btrim(author) <> ''),
  add constraint books_pages_positive check (pages > 0);

create sequence if not exists public.books_sort_order_seq
  owned by public.books.sort_order;

select setval(
  'public.books_sort_order_seq',
  coalesce((select max(sort_order) from public.books), -1) + 1,
  false
);

alter table public.books
  alter column sort_order set default nextval('public.books_sort_order_seq');
