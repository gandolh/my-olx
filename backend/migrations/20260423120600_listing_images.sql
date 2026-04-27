CREATE TABLE listing_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key      TEXT NOT NULL,     -- e.g. listings/<listing_id>/<uuid>.jpg
    position    INT NOT NULL,      -- 0 = primary, 1..9 = rest
    width       INT,
    height      INT,
    bytes       BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, position)
);
CREATE INDEX listing_images_listing_idx ON listing_images (listing_id, position);
