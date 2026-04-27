CREATE TABLE phone_verification_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone       TEXT NOT NULL,
    code_hash   TEXT NOT NULL,  -- store hash, never plaintext
    attempts    INT NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX phone_verification_codes_user_idx ON phone_verification_codes (user_id);
