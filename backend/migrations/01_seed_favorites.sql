-- Seed data for favorites flows (idempotent)
-- Usage:
--   psql "$DATABASE_URL" -f scripts/seed_favorites.sql

BEGIN;

-- Buyer (the account that will own favorites)
INSERT INTO users (id, email, password_hash, display_name, email_verified, phone, phone_verified)
VALUES (
  '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
  'jane.doe@example.com',
  -- pw: 12345678
  '$argon2id$v=19$m=19456,t=2,p=1$dBYsj7NPtnrhBt6UIgm5zg$xGPHGWhMMyHbTy91+149r3QfjKj1Qn5xkHdjDJ5noww',
  'Jane Doe',
  TRUE,
  '+40740111222',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Listings to favorite
INSERT INTO listings (
  id,
  user_id,
  title,
  description,
  price_ron,
  is_negotiable,
  category,
  city,
  active,
  view_count,
  expires_at,
  created_at,
  updated_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'Dacia Duster 2019, 1.5 dCi, euro 6',
    'Mașină întreținută, distribuție schimbată, fără daune, istoric service complet.',
    69900,
    TRUE,
    'Auto',
    'București',
    TRUE,
    124,
    NOW() + INTERVAL '25 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'BMW Seria 3 G20, 2020, pachet M',
    'Unic proprietar, cutie automată, pilot adaptiv, cameră 360, jante 18.',
    157000,
    FALSE,
    'Auto',
    'Cluj-Napoca',
    TRUE,
    89,
    NOW() + INTERVAL '28 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'iPhone 14 Pro 256GB, Deep Purple',
    'Telefon în stare excelentă, baterie 92%, cutie și factură disponibile.',
    3899,
    TRUE,
    'Electronice',
    'Iași',
    TRUE,
    211,
    NOW() + INTERVAL '20 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'Laptop Lenovo ThinkPad T14 Gen 2',
    'Ryzen 7, 16GB RAM, SSD 512GB, ideal pentru programare și lucru remote.',
    3200,
    TRUE,
    'Electronice',
    'Timișoara',
    TRUE,
    65,
    NOW() + INTERVAL '18 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'Canapea extensibilă 3 locuri, gri deschis',
    'Canapea modernă, material textil, foarte puțin folosită, ideală pentru living.',
    1450,
    TRUE,
    'Casă și grădină',
    'Brașov',
    TRUE,
    37,
    NOW() + INTERVAL '27 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    '12f915c3-65a3-4c18-86c2-64d9bfdb2a5c',
    'Set masă dining + 4 scaune stejar',
    'Lemn masiv, stare foarte bună, potrivit pentru apartament sau casă.',
    2100,
    FALSE,
    'Casă și grădină',
    'Constanța',
    TRUE,
    49,
    NOW() + INTERVAL '22 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_images (id, listing_id, s3_key, position)
VALUES
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'demo/listings/duster-cover.jpg', 0),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'demo/listings/bmw-cover.jpg', 0),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'demo/listings/iphone-cover.jpg', 0),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'demo/listings/thinkpad-cover.jpg', 0),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'demo/listings/canapea-cover.jpg', 0),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'demo/listings/dining-cover.jpg', 0)
ON CONFLICT (listing_id, position) DO NOTHING;

-- Favorites for the buyer account above
INSERT INTO favorites (user_id, listing_id, created_at)
VALUES
  ('12f915c3-65a3-4c18-86c2-64d9bfdb2a5c', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', NOW() - INTERVAL '4 hours'),
  ('12f915c3-65a3-4c18-86c2-64d9bfdb2a5c', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', NOW() - INTERVAL '2 hours'),
  ('12f915c3-65a3-4c18-86c2-64d9bfdb2a5c', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', NOW() - INTERVAL '30 minutes')
ON CONFLICT (user_id, listing_id) DO NOTHING;

COMMIT;
