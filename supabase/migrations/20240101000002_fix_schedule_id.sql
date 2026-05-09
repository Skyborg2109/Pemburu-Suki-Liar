-- Migration: Fix schedule_id in bookings (TEXT → UUID FK)
-- and ensure schedules.departure_time is stored as "HH:MM" text
--
-- WARNING: This truncates bookings and booking_passengers.
-- Only run on development/fresh databases.
-- For production, implement a data migration script first.

-- Step 1: Clear dependent data
truncate table booking_passengers cascade;
truncate table bookings cascade;
truncate table schedules cascade;

-- Step 2: Alter bookings.schedule_id from TEXT to UUID FK
alter table bookings drop column schedule_id;
alter table bookings add column schedule_id uuid not null references schedules(id) on delete restrict;

-- Step 3: Re-run seed data (routes + bus_classes are preserved via ON CONFLICT DO NOTHING)
-- Re-seed schedules with correct per-time-slot data
DO $$
DECLARE
  r_id    uuid;
  c_id    uuid;
  dur_txt text;
  sched   text[];
  d       date;
  dep_str text;
  dep     time;
  arr     time;
  base    integer;
  mult    numeric;
  seats   integer;
  price   integer;
  dur_hrs integer;
BEGIN
  FOR r_id, base, dur_txt, sched IN
    SELECT id, base_price::integer, duration, schedule FROM routes
  LOOP
    dur_hrs := (regexp_replace(dur_txt, '[^0-9]', '', 'g'))::integer;

    FOR c_id, mult, seats IN
      SELECT id, price_multiplier, seats_count FROM bus_classes
    LOOP
      price := (base * mult)::integer;

      FOR d IN
        SELECT generate_series(CURRENT_DATE, CURRENT_DATE + 6, '1 day')::date
      LOOP
        FOREACH dep_str IN ARRAY sched
        LOOP
          dep := dep_str::time;
          arr := dep + (dur_hrs || ' hours')::interval;

          INSERT INTO schedules (
            id, route_id, bus_class_id, departure_time, arrival_time,
            date, available_seats, total_seats, price, status
          )
          VALUES (
            gen_random_uuid(), r_id, c_id,
            dep_str, arr::text,
            d, seats, seats, price, 'scheduled'
          )
          ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;
