ALTER TABLE listings
    ADD COLUMN search_tsv tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', unaccent(coalesce(title, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'B')
    ) STORED;

CREATE INDEX listings_search_tsv_idx ON listings USING GIN (search_tsv);
