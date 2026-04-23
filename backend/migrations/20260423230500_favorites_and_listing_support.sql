CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS view_count BIGINT NOT NULL DEFAULT 0;

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS search_tsv tsvector;

CREATE OR REPLACE FUNCTION listings_search_tsv_update() RETURNS trigger AS $$
BEGIN
    NEW.search_tsv :=
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.title, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.description, ''))), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_search_tsv_update_trigger ON listings;
CREATE TRIGGER listings_search_tsv_update_trigger
BEFORE INSERT OR UPDATE OF title, description ON listings
FOR EACH ROW EXECUTE FUNCTION listings_search_tsv_update();

UPDATE listings
SET search_tsv =
    setweight(to_tsvector('simple', unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'B')
WHERE search_tsv IS NULL;

CREATE INDEX IF NOT EXISTS listings_search_tsv_idx ON listings USING GIN (search_tsv);

CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, position)
);

CREATE INDEX IF NOT EXISTS listing_images_listing_idx ON listing_images (listing_id, position);

CREATE TABLE IF NOT EXISTS favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_created_at_idx ON favorites (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON favorites (listing_id);
