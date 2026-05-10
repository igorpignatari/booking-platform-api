CREATE TABLE IF NOT EXISTS auth (
  jti         UUID         PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ  NOT NULL,
  revoked_at  TIMESTAMPTZ  NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_user_id ON auth(user_id);
