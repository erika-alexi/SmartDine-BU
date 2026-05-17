-- SmartDine BU Supabase database setup
-- This matches the deployed Supabase project schema used by the Vercel app.
-- Run in Supabase Dashboard > SQL Editor > New query.

create extension if not exists "pgcrypto";

-- User profile details. Passwords are NOT stored here.
-- Supabase Auth stores secure login accounts in auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'student'
    check (role in ('student', 'faculty', 'staff', 'admin')),
  student_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  image_url text,
  allergens text[] not null default '{}',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  user_email text not null,
  student_id text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled')),
  payment_method text not null
    check (payment_method in ('COD', 'GCash')),
  pickup_time text not null,
  pickup_type text not null default 'Scheduled'
    check (pickup_type in ('ASAP', 'Scheduled')),
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  priority_fee numeric(10, 2) not null default 0 check (priority_fee >= 0),
  total numeric(10, 2) not null check (total >= 0),
  admin_confirmed boolean not null default false,
  customer_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists pickup_type text not null default 'Scheduled'
    check (pickup_type in ('ASAP', 'Scheduled'));

alter table public.orders
  add column if not exists subtotal numeric(10, 2) not null default 0 check (subtotal >= 0);

alter table public.orders
  add column if not exists priority_fee numeric(10, 2) not null default 0 check (priority_fee >= 0);

-- Notifications are handled as in-app UI state, so no Supabase notifications table is required.
drop table if exists public.notifications cascade;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  menu_item_id text references public.menu_items(id) on delete set null,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  add_ons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.nlp_chat_messages (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  user_message text not null,
  bot_response text not null,
  sentiment text not null check (sentiment in ('Positive', 'Negative', 'Neutral')),
  sentiment_score integer not null default 0,
  intent text not null,
  tokens text[] not null default '{}',
  keywords text[] not null default '{}',
  entities text[] not null default '{}',
  nlp_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists nlp_chat_messages_user_id_idx on public.nlp_chat_messages(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Automatically create a public profile whenever a Supabase Auth user is created.
-- This keeps frontend registration, RLS policies, and order inserts aligned.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');

  insert into public.profiles (id, full_name, email, role, student_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    case
      when requested_role in ('student', 'faculty', 'staff', 'admin') then requested_role
      else 'student'
    end,
    nullif(new.raw_user_meta_data ->> 'student_id', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    student_id = excluded.student_id;

  return new;
end;
$$;

-- Use a SECURITY DEFINER helper for admin checks.
-- Directly querying public.profiles inside policies can recurse through profiles RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.nlp_chat_messages enable row level security;

-- Reset policies so the script can be run again safely.
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

drop policy if exists "Anyone can view available menu items" on public.menu_items;
drop policy if exists "Admins can manage menu items" on public.menu_items;

drop policy if exists "Users can create own orders" on public.orders;
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can update own confirmation" on public.orders;
drop policy if exists "Admins can manage all orders" on public.orders;

drop policy if exists "Users can create order items for own orders" on public.order_items;
drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Admins can view all order items" on public.order_items;

drop policy if exists "Users can create own NLP chats" on public.nlp_chat_messages;
drop policy if exists "Users can view own NLP chats" on public.nlp_chat_messages;
drop policy if exists "Admins can view all NLP chats" on public.nlp_chat_messages;

create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

create policy "Anyone can view available menu items"
on public.menu_items for select
to anon, authenticated
using (available = true);

create policy "Admins can manage menu items"
on public.menu_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can create own orders"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update own confirmation"
on public.orders for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
on public.orders for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can create order items for own orders"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

create policy "Users can view own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

create policy "Admins can view all order items"
on public.order_items for select
to authenticated
using (public.is_admin());

create policy "Users can create own NLP chats"
on public.nlp_chat_messages for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can view own NLP chats"
on public.nlp_chat_messages for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all NLP chats"
on public.nlp_chat_messages for select
to authenticated
using (public.is_admin());

-- Starter menu data from the SmartDine BU prototype.
-- Admin setup:
-- 1. Create or register the admin account first so it exists in Supabase Auth.
-- 2. This project currently promotes this initial admin email:
update public.profiles
set role = 'admin'
where email = 'eamm2023-3931-34889@bicol-u.edu.ph';
-- 3. Add the other two admin emails later using the same update statement.

insert into public.menu_items (id, name, price, category, image_url, allergens, available)
values
  ('main-1', 'Adobo', 75, 'Main Dishes', 'https://cdn.designfast.io/image/2026-03-20/e0dc9c17-eb90-45a7-a28f-c9f621d8bf3f.jpeg', array['Soy'], true),
  ('main-2', 'Sinigang', 80, 'Main Dishes', 'https://cdn.designfast.io/image/2026-03-20/100c6b97-585d-4d7f-a5b3-cd808a019cdb.jpeg', array['Shellfish'], true),
  ('main-3', 'Kare-Kare', 95, 'Main Dishes', 'https://cdn.designfast.io/image/2026-03-20/c253b147-7f67-42c2-9607-853f14398a28.jpeg', array['Peanuts'], true),
  ('main-4', 'Fried Chicken', 85, 'Main Dishes', 'https://cdn.designfast.io/image/2026-03-20/aac80fd9-9a63-4068-bbfc-08787157a95f.jpeg', array[]::text[], true),
  ('main-5', 'Bicol Express', 90, 'Main Dishes', 'https://cdn.designfast.io/image/2026-03-20/dbe7accd-d630-491d-970c-14f18db5368b.jpeg', array['Dairy'], true),
  ('rice-1', 'Tapsilog', 70, 'Rice Meals', 'https://cdn.designfast.io/image/2026-03-20/5f852354-a1af-45b4-8086-d047fdbf6dec.jpeg', array['Soy'], true),
  ('rice-2', 'Hamsilog', 65, 'Rice Meals', 'https://cdn.designfast.io/image/2026-03-20/deef82c7-24a8-4be8-b38f-f53b1d946bcb.jpeg', array[]::text[], true),
  ('rice-3', 'Hotsilog', 60, 'Rice Meals', 'https://cdn.designfast.io/image/2026-03-20/2909876c-a1bd-4e12-b55a-d4e068dda877.jpeg', array[]::text[], true),
  ('rice-4', 'Tocilog', 70, 'Rice Meals', 'https://cdn.designfast.io/image/2026-03-20/c5fd52f8-3ca6-4fcc-90ed-5410d2be8f03.jpeg', array['Soy'], true),
  ('noodle-1', 'Pancit Bihon', 50, 'Noodles & Soups', 'https://cdn.designfast.io/image/2026-03-20/e16e4b69-01df-4537-92af-2e945bd1409a.jpeg', array['Soy'], true),
  ('noodle-2', 'Lomi', 55, 'Noodles & Soups', 'https://cdn.designfast.io/image/2026-03-20/3627bff0-6472-44b4-a56d-7242e9b00027.jpeg', array['Eggs'], true),
  ('noodle-3', 'Lugaw', 40, 'Noodles & Soups', 'https://cdn.designfast.io/image/2026-03-20/d5ba9ec0-f465-4c76-b946-30efcd48f6d2.jpeg', array[]::text[], true),
  ('noodle-4', 'Mami', 50, 'Noodles & Soups', 'https://cdn.designfast.io/image/2026-03-20/d17e3d91-18c2-43cb-8fcc-f9c5e9023d93.jpeg', array['Soy'], true),
  ('snack-1', 'Pandesal', 5, 'Snacks', 'https://cdn.designfast.io/image/2026-03-20/92dd46af-a936-4bbe-8ade-b8ba795b3cf8.jpeg', array['Gluten'], true),
  ('snack-2', 'Ensaymada', 15, 'Snacks', 'https://cdn.designfast.io/image/2026-03-20/2f982c87-3d6d-4c2c-94f9-84a7e76cf34d.jpeg', array['Gluten','Dairy'], true),
  ('snack-3', 'Spanish Bread', 12, 'Snacks', 'https://cdn.designfast.io/image/2026-03-20/2f398e3c-0a64-450e-962a-2f44e872f3cb.jpeg', array['Gluten'], true),
  ('snack-4', 'Chips', 20, 'Snacks', 'https://cdn.designfast.io/image/2026-03-20/b0a61075-541d-4756-aaae-9a896f5fa6f3.jpeg', array[]::text[], true),
  ('snack-5', 'Chicharon', 25, 'Snacks', 'https://cdn.designfast.io/image/2026-03-20/774decdd-7e85-4099-aaa3-ebb92aa19a9a.jpeg', array[]::text[], true),
  ('dessert-1', 'Turon', 20, 'Desserts', 'https://cdn.designfast.io/image/2026-03-20/dfd2b9bd-d5f9-4be4-b4a2-7f4804401caa.jpeg', array[]::text[], true),
  ('dessert-2', 'Ice Cream', 30, 'Desserts', 'https://cdn.designfast.io/image/2026-03-20/0191064b-0354-41cd-9ea8-8b66019f78c9.jpeg', array['Dairy'], true),
  ('dessert-3', 'Puto', 10, 'Desserts', 'https://cdn.designfast.io/image/2026-03-20/4f2a0707-7a02-4fcf-ac9a-29b9b897bad9.jpeg', array[]::text[], true),
  ('dessert-4', 'Bibingka', 25, 'Desserts', 'https://cdn.designfast.io/image/2026-03-20/99812d49-0c16-4d57-830f-417ae7ef6529.jpeg', array['Dairy','Eggs'], true),
  ('dessert-5', 'Suman', 15, 'Desserts', 'https://cdn.designfast.io/image/2026-03-20/0456d19b-e40b-4895-aeed-ef3ed889ac66.jpeg', array[]::text[], true),
  ('drink-1', 'Coke', 25, 'Beverages', 'https://cdn.designfast.io/image/2026-03-20/fb6b72e6-d6e7-446d-922c-6f88b4e3533e.png', array[]::text[], true),
  ('drink-2', 'Sprite', 25, 'Beverages', 'https://cdn.designfast.io/image/2026-03-20/d0a83867-89d8-4328-b54b-f01b84871dae.jpeg', array[]::text[], true),
  ('drink-3', 'Royal', 25, 'Beverages', 'https://cdn.designfast.io/image/2026-03-20/d09b370d-3dcf-47bf-aae9-7f68306f4a97.jpeg', array[]::text[], true),
  ('drink-4', 'Mountain Dew', 25, 'Beverages', 'https://cdn.designfast.io/image/2026-03-20/4556587b-9c95-4229-aae6-31b7fe3cb87d.jpeg', array[]::text[], true),
  ('drink-5', 'Bottled Water', 15, 'Beverages', 'https://cdn.designfast.io/image/2026-03-20/31d182ba-224b-4850-9dea-eec689483e03.png', array[]::text[], true),
  ('street-1', 'Kwek-Kwek', 20, 'Street Food', 'https://cdn.designfast.io/image/2026-03-20/f33324ad-6b7e-41b4-b153-8c083345a13d.jpeg', array['Eggs'], true),
  ('street-2', 'Fish Balls', 15, 'Street Food', 'https://cdn.designfast.io/image/2026-03-20/602b897c-0481-40f8-8f7a-2760cdb0a7a5.jpeg', array[]::text[], true),
  ('street-3', 'Kikiam', 20, 'Street Food', 'https://cdn.designfast.io/image/2026-03-20/0b456d7f-d80d-40d5-9cc9-84d3427ee453.jpeg', array['Soy'], true),
  ('extra-1', 'Fried Egg', 10, 'Add-ons', 'https://cdn.designfast.io/image/2026-03-20/f5ba0727-4fb3-4da0-a307-167df5ad61a4.jpeg', array['Eggs'], true),
  ('extra-2', 'Lumpia', 15, 'Add-ons', 'https://cdn.designfast.io/image/2026-03-20/f738f023-d1f3-4bf2-a283-7fa4500393c8.webp', array[]::text[], true),
  ('extra-3', 'Rice Refill', 10, 'Add-ons', 'https://cdn.designfast.io/image/2026-03-20/92ec6d79-db1a-420a-8114-573d2e5d2671.webp', array[]::text[], true)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url,
  allergens = excluded.allergens,
  available = excluded.available;
