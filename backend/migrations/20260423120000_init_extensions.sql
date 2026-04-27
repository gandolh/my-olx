CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- Romanian diacritic folding
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram for fuzzy fallback

-- unaccent is not immutable by default, which prevents its use in generated columns.
-- We create an immutable wrapper for it.
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
    SELECT unaccent($1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;
