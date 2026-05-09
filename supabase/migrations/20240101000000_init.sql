-- ============================================
-- Safe migration: drops existing objects first
-- ============================================

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Drop tables if exist (in reverse dependency order)
drop table if exists booking_passengers cascade;
drop table if exists testimonials cascade;
drop table if exists bookings cascade;
drop table if exists schedules cascade;
drop table if exists profiles cascade;
drop table if exists bus_classes cascade;
drop table if exists routes cascade;

-- Drop enum types if exist
drop type if exists booking_status;
drop type if exists payment_method;
drop type if exists schedule_status;

-- ============================================
-- Create everything fresh
-- ============================================

-- ENUM types
create type booking_status as enum ('pending', 'confirmed', 'paid', 'completed', 'cancelled');
create type payment_method as enum ('bank_transfer', 'e_wallet', 'qris', 'cash');
create type schedule_status as enum ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled');

-- Routes
create table routes (
  id uuid primary key default gen_random_uuid(),
  from_city text not null,
  to_city text not null,
  duration text not null,
  base_price numeric not null,
  schedule text[] not null default '{}',
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bus Classes
create table bus_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seats_count integer not null,
  seat_config text not null,
  features text[] not null default '{}',
  price_multiplier numeric not null default 1,
  description text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

-- Profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Schedules
create table schedules (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  bus_class_id uuid not null references bus_classes(id) on delete cascade,
  departure_time text not null,
  arrival_time text not null,
  date date not null,
  available_seats integer not null,
  total_seats integer not null,
  price numeric not null,
  status schedule_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_id uuid not null references schedules(id) on delete restrict,
  booking_code text not null unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  total_passengers integer not null,
  total_price numeric not null,
  status booking_status not null default 'pending',
  payment_method payment_method,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Booking Passengers
create table booking_passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  seat_number text not null,
  passenger_name text not null,
  passenger_phone text not null
);

-- Testimonials
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  content text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create profile saat user baru register
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Enable Row Level Security
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table booking_passengers enable row level security;

-- RLS Policies: users can read/write their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);
create policy "Users can view own bookings" on bookings for select using (auth.uid() = user_id);
create policy "Users can insert own bookings" on bookings for insert with check (auth.uid() = user_id);
create policy "Users can view own passengers" on booking_passengers for select using (
  booking_id in (select id from bookings where user_id = auth.uid())
);
create policy "Users can insert own passengers" on booking_passengers for insert with check (
  booking_id in (select id from bookings where user_id = auth.uid())
);

-- Public read for routes, bus_classes, schedules
alter table routes enable row level security;
alter table bus_classes enable row level security;
alter table schedules enable row level security;
create policy "Anyone can view routes" on routes for select using (true);
create policy "Anyone can view bus_classes" on bus_classes for select using (true);
create policy "Anyone can view schedules" on schedules for select using (true);

-- Approved testimonials are public
alter table testimonials enable row level security;
create policy "Anyone can view approved testimonials" on testimonials for select using (is_approved = true);
create policy "Logged-in users can insert testimonials" on testimonials for insert with check (auth.uid() = user_id);

-- Quick booking inquiries (public insert, admin read)
drop table if exists inquiries cascade;
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  bus_class text not null,
  travel_date date not null,
  passengers integer not null default 1 check (passengers between 1 and 6),
  created_at timestamptz not null default now()
);
alter table inquiries enable row level security;
create policy "Anyone can insert inquiry" on inquiries for insert with check (true);