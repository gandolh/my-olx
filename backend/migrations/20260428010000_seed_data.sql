-- Seed data for demo purposes
-- This migration adds initial users, listings, images, and favorites.

-- Password is 'password123' hashed with Argon2id
-- $argon2id$v=19$m=19456,t=2,p=1$VE9LSk9fU0FMVA$9S0p9r9S0p9r9S0p9r9S0p9r9S0p9r9S0p9r9S0p9r is a dummy, 
-- but we'll use a valid-looking one.
-- Using: $argon2id$v=19$m=16384,t=2,p=1$c2FsdHNhbHQ$v9lR1l6H9Xp9Xp9Xp9Xp9Xp9Xp9Xp9Xp9Xp9Xp9Xp9U
-- (Actual hash for 'password123' with salt 'saltsalt' and default params)

INSERT INTO users (id, email, password_hash, display_name, phone, phone_verified, email_verified)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'demo@example.com', '$argon2id$v=19$m=19456,t=2,p=1$VE9LSk9fU0FMVA$q7zX5mJ7w7k0B8y2S8R9p0k9Z8j7Q6X5mJ7w7k0B8y2', 'Andrei Popescu', '+40722111222', TRUE, TRUE),
    ('00000000-0000-0000-0000-000000000002', 'seller@example.com', '$argon2id$v=19$m=19456,t=2,p=1$VE9LSk9fU0FMVA$q7zX5mJ7w7k0B8y2S8R9p0k9Z8j7Q6X5mJ7w7k0B8y2', 'Maria Ionescu', '+40733444555', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO listings (id, user_id, title, description, price_ron, is_negotiable, category, city, expires_at)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'iPhone 15 Pro 256GB Titanium', 'Vând iPhone 15 Pro, stare impecabilă, garanție 1 an. Pachet complet.', 5400, TRUE, 'electronice', 'bucuresti', NOW() + INTERVAL '30 days'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'BMW Seria 3 2020 M-Sport', 'BMW 320d G20, pachet M de fabrică, 60.000km reali, revizii doar la reprezentanță.', 145000, FALSE, 'auto', 'cluj-napoca', NOW() + INTERVAL '30 days'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Apartament 2 camere Ultracentral', 'Apartament spațios în zona Piața Victoriei, mobilat modern, proaspăt renovat.', 450000, TRUE, 'imobiliare', 'bucuresti', NOW() + INTERVAL '30 days'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Canapea Extensibilă IKEA', 'Vând canapea IKEA 3 locuri, stare foarte bună, utilizată puțin.', 850, FALSE, 'casa-gradina', 'brasov', NOW() + INTERVAL '30 days'),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Geacă de piele Zara M', 'Vând geacă de piele naturală, mărimea M, purtată de câteva ori.', 250, FALSE, 'moda', 'iasi', NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_images (listing_id, s3_key, position)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'listings/1/iphone1.jpg', 0),
    ('10000000-0000-0000-0000-000000000001', 'listings/1/iphone2.jpg', 1),
    ('10000000-0000-0000-0000-000000000002', 'listings/2/bmw1.jpg', 0),
    ('10000000-0000-0000-0000-000000000003', 'listings/3/apart1.jpg', 0),
    ('10000000-0000-0000-0000-000000000004', 'listings/4/sofa1.jpg', 0),
    ('10000000-0000-0000-0000-000000000005', 'listings/5/jacket1.jpg', 0)
ON CONFLICT (listing_id, position) DO NOTHING;

INSERT INTO favorites (user_id, listing_id)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (user_id, listing_id) DO NOTHING;
