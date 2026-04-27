CREATE TABLE listings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    price_ron     BIGINT,                     -- NULL = free
    is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    category      TEXT NOT NULL,              -- slug from HomePage CATEGORIES
    city          TEXT NOT NULL,              -- slug from frontend CITIES
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    view_count    BIGINT NOT NULL DEFAULT 0,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX listings_user_id_idx        ON listings (user_id);
CREATE INDEX listings_category_idx       ON listings (category) WHERE active = TRUE;
CREATE INDEX listings_city_idx           ON listings (city) WHERE active = TRUE;
CREATE INDEX listings_created_at_idx     ON listings (created_at DESC) WHERE active = TRUE;
CREATE INDEX listings_expires_at_idx     ON listings (expires_at) WHERE active = TRUE;
