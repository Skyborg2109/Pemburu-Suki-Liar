-- Seed data for routes, bus_classes, and schedules

-- ─── Routes ───────────────────────────────────────────────────────────────────
INSERT INTO routes (id, from_city, to_city, duration, base_price, schedule, image_url, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111001', 'Jakarta', 'Bandung',    '3 Jam',    85000,  ARRAY['06:00','09:00','12:00','15:00','18:00'], '', true),
  ('11111111-1111-1111-1111-111111111002', 'Jakarta', 'Semarang',   '5 Jam',    150000, ARRAY['07:00','13:00','20:00'],                 '', true),
  ('11111111-1111-1111-1111-111111111003', 'Jakarta', 'Yogyakarta', '8 Jam',    175000, ARRAY['08:00','19:00','21:00'],                 '', true),
  ('11111111-1111-1111-1111-111111111004', 'Jakarta', 'Surabaya',   '12 Jam',   250000, ARRAY['08:00','20:00'],                         '', true),
  ('11111111-1111-1111-1111-111111111005', 'Bandung',  'Jakarta',   '3 Jam',    85000,  ARRAY['06:00','09:00','12:00','15:00','18:00'], '', true),
  ('11111111-1111-1111-1111-111111111006', 'Semarang', 'Jakarta',   '5 Jam',    150000, ARRAY['07:00','13:00','20:00'],                 '', true),
  ('11111111-1111-1111-1111-111111111007', 'Yogyakarta','Jakarta',  '8 Jam',    175000, ARRAY['08:00','19:00'],                         '', true),
  ('11111111-1111-1111-1111-111111111008', 'Surabaya', 'Jakarta',   '12 Jam',   250000, ARRAY['08:00','20:00'],                         '', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Bus Classes ──────────────────────────────────────────────────────────────
INSERT INTO bus_classes (id, name, seats_count, seat_config, features, price_multiplier, description, image_url)
VALUES
  ('22222222-2222-2222-2222-222222222001', 'Executive',       40, '2-2',
   ARRAY['AC', 'Reclining Seat', 'USB Charging', 'Toilet'],
   1.0, 'Kenyamanan standar untuk perjalanan jauh', ''),
  ('22222222-2222-2222-2222-222222222002', 'Super Executive', 30, '2-1',
   ARRAY['AC', 'Fully Reclining', 'USB Charging', 'Toilet', 'Snack', 'Entertainment'],
   1.5, 'Kenyamanan premium dengan kursi yang lebih luas', ''),
  ('22222222-2222-2222-2222-222222222003', 'Royal Class',     20, '1-1',
   ARRAY['AC', 'Lie-Flat Seat', 'USB Charging', 'Private Toilet', 'Full Meal', 'WiFi'],
   2.5, 'Pengalaman perjalanan mewah dengan fasilitas terlengkap', '')
ON CONFLICT (id) DO NOTHING;

-- ─── Schedules (next 7 days × each route × each class × each time slot) ──────
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
    -- Parse "N Jam" → N hours
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
            gen_random_uuid(),
            r_id,
            c_id,
            dep_str,        -- stored as "HH:MM" text
            arr::text,      -- stored as "HH:MM:SS" text
            d,
            seats,
            seats,
            price,
            'scheduled'
          )
          ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;
