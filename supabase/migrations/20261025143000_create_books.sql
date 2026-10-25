create table if not exists public.books (
  slug text primary key,
  title text not null,
  author text not null,
  year integer not null,
  pages integer not null,
  genre text not null,
  blurb text not null,
  cover jsonb not null,
  featured boolean not null default false,
  sort_order integer not null,
  constraint books_genre_check check (
    genre in (
      'Fiction',
      'Fantasy',
      'Science Fiction',
      'Mystery',
      'Memoir',
      'History',
      'Classics'
    )
  )
);

alter table public.books enable row level security;

grant select on public.books to anon, authenticated;

drop policy if exists "Public can read books" on public.books;
create policy "Public can read books"
  on public.books
  for select
  to anon, authenticated
  using (true);

insert into public.books (
  slug, title, author, year, pages, genre, blurb, cover, featured, sort_order
)
values
('piranesi', 'Piranesi', 'Susanna Clarke', 2020, 245, 'Fantasy', 'A man catalogs endless halls of statues and tides, naming the world as carefully as he can. The mystery is what the house remembers that he does not.', '{"background":"#1d3a4a","foreground":"#f3efe4","spine":"#c4a574"}'::jsonb, true, 0),
('circe', 'Circe', 'Madeline Miller', 2018, 393, 'Fantasy', 'A nymph banished to an island learns witchcraft, and what it costs to stop being underestimated. The story stays with her long after the famous men sail on.', '{"background":"#6b3a2a","foreground":"#f8f1e8","spine":"#e7c27a"}'::jsonb, true, 1),
('the-song-of-achilles', 'The Song of Achilles', 'Madeline Miller', 2011, 416, 'Fantasy', 'Patroclus grows up beside Achilles and loves him before the war makes the story famous. The telling belongs to the one history usually leaves in the margin.', '{"background":"#6a3a3a","foreground":"#f8efe8","spine":"#e7b8a0"}'::jsonb, false, 2),
('the-left-hand-of-darkness', 'The Left Hand of Darkness', 'Ursula K. Le Guin', 1969, 304, 'Science Fiction', 'On a winter planet, an envoy tries to understand a people who are neither men nor women. Trust is built slowly, across ice.', '{"background":"#243044","foreground":"#e4eef4","spine":"#7eb0c4"}'::jsonb, false, 3),
('project-hail-mary', 'Project Hail Mary', 'Andy Weir', 2021, 476, 'Science Fiction', 'A science teacher wakes alone on a ship with the fate of Earth in the lab notes he can barely read. The problem is enormous, and he is not as alone as he thinks.', '{"background":"#3d3424","foreground":"#f6edd4","spine":"#d07a2a"}'::jsonb, false, 4),
('dune', 'Dune', 'Frank Herbert', 1965, 688, 'Science Fiction', 'Paul Atreides arrives on a desert planet that everyone wants to control. Water is scarce, spice is everything, and prophecy is a dangerous tool.', '{"background":"#8a5a32","foreground":"#fbf6ea","spine":"#e6c98a"}'::jsonb, false, 5),
('klara-and-the-sun', 'Klara and the Sun', 'Kazuo Ishiguro', 2021, 303, 'Science Fiction', 'Klara, an artificial friend, watches the street from a shop window and studies the humans she is built to accompany. Devotion, for her, is a kind of attention.', '{"background":"#e4d3b0","foreground":"#2a241c","spine":"#8f3d2b"}'::jsonb, true, 6),
('station-eleven', 'Station Eleven', 'Emily St. John Mandel', 2014, 333, 'Fiction', 'After a flu unravels the world, a troupe of actors walks between settlements performing Shakespeare. What survives is practical, and it is also art.', '{"background":"#1f2a28","foreground":"#f3ecdf","spine":"#c45c4a"}'::jsonb, true, 7),
('the-remains-of-the-day', 'The Remains of the Day', 'Kazuo Ishiguro', 1989, 245, 'Fiction', 'An English butler looks back on a life of perfect service and wonders what it cost him to stay loyal. The rooms are immaculate. The regret is quiet.', '{"background":"#3e4634","foreground":"#f6f2e8","spine":"#cbb98a"}'::jsonb, false, 8),
('beloved', 'Beloved', 'Toni Morrison', 1987, 324, 'Fiction', 'Sethe has escaped slavery, but the past arrives at her door in a form she cannot turn away. The novel asks what a free life is able to hold.', '{"background":"#3a2428","foreground":"#f8efe9","spine":"#d7a394"}'::jsonb, false, 9),
('a-gentleman-in-moscow', 'A Gentleman in Moscow', 'Amor Towles', 2016, 462, 'Fiction', 'Count Rostov is sentenced to live out his days inside a grand hotel. From one building, he watches a country rearrange itself.', '{"background":"#3a2c38","foreground":"#f8f2ea","spine":"#c9a27a"}'::jsonb, true, 10),
('the-vanishing-half', 'The Vanishing Half', 'Brit Bennett', 2020, 343, 'Fiction', 'Twin sisters leave a small town and choose different ways to be seen. The story follows that choice through their daughters'' lives.', '{"background":"#24324a","foreground":"#f6f2e8","spine":"#e0b7a4"}'::jsonb, true, 11),
('tomorrow-and-tomorrow-and-tomorrow', 'Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 2022, 401, 'Fiction', 'Sam and Sadie design games together across decades of friendship, success, and silence. The work is the way they keep finding each other.', '{"background":"#2a3140","foreground":"#f4f0e6","spine":"#e07a5f"}'::jsonb, false, 12),
('the-secret-history', 'The Secret History', 'Donna Tartt', 1992, 559, 'Mystery', 'A circle of classics students at a Vermont college commits itself to beauty, and then to something much worse. The narrator already knows how it ends.', '{"background":"#2c2a33","foreground":"#f3ecdc","spine":"#8c6b4f"}'::jsonb, false, 13),
('mexican-gothic', 'Mexican Gothic', 'Silvia Moreno-Garcia', 2020, 301, 'Mystery', 'Noemí travels to a moldering house in the Mexican countryside to check on her cousin. The walls are damp, and the family is worse.', '{"background":"#1e3328","foreground":"#f4f1e4","spine":"#b7c47a"}'::jsonb, false, 14),
('the-name-of-the-rose', 'The Name of the Rose', 'Umberto Eco', 1980, 536, 'Mystery', 'In a medieval abbey, a visiting friar investigates a death in the scriptorium. The library is a labyrinth, and the books are not innocent.', '{"background":"#3a2a22","foreground":"#f6f0e4","spine":"#a33b2b"}'::jsonb, false, 15),
('educated', 'Educated', 'Tara Westover', 2018, 334, 'Memoir', 'Raised without school in the mountains of Idaho, Westover studies her way into a different life. Leaving does not settle the question of who she is.', '{"background":"#4a3428","foreground":"#f8f3ea","spine":"#d8b48a"}'::jsonb, false, 16),
('braiding-sweetgrass', 'Braiding Sweetgrass', 'Robin Wall Kimmerer', 2013, 408, 'Memoir', 'A botanist and member of the Citizen Potawatomi Nation writes about plants as teachers. Science and gratitude sit on the same page.', '{"background":"#24382c","foreground":"#f4f1e4","spine":"#d2c07a"}'::jsonb, false, 17),
('the-warmth-of-other-suns', 'The Warmth of Other Suns', 'Isabel Wilkerson', 2010, 622, 'History', 'Wilkerson follows three travelers in the Great Migration out of the American South. The history is told at the scale of a life.', '{"background":"#6a2e24","foreground":"#fbf4ec","spine":"#e6c27a"}'::jsonb, false, 18),
('say-nothing', 'Say Nothing', 'Patrick Radden Keefe', 2018, 441, 'History', 'A mother''s disappearance in Belfast opens into a history of the Troubles. Keefe stays with the people who lived inside the secrets.', '{"background":"#2e3136","foreground":"#f3efe6","spine":"#c4553a"}'::jsonb, false, 19),
('pride-and-prejudice', 'Pride and Prejudice', 'Jane Austen', 1813, 279, 'Classics', 'Elizabeth Bennet meets a proud stranger and decides, too quickly, that she already understands him. The comedy is in how both of them revise that opinion.', '{"background":"#3d3a32","foreground":"#f8f4ec","spine":"#c4b48a"}'::jsonb, false, 20),
('their-eyes-were-watching-god', 'Their Eyes Were Watching God', 'Zora Neale Hurston', 1937, 219, 'Classics', 'Janie Crawford tells the story of her three marriages and the self she keeps reaching for. The voice of the book is as alive as the storm at its center.', '{"background":"#3f4a28","foreground":"#f7f3e4","spine":"#e0b15a"}'::jsonb, false, 21)
on conflict (slug) do update set
  title = excluded.title,
  author = excluded.author,
  year = excluded.year,
  pages = excluded.pages,
  genre = excluded.genre,
  blurb = excluded.blurb,
  cover = excluded.cover,
  featured = excluded.featured,
  sort_order = excluded.sort_order;
