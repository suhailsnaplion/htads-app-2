-- HT Ads — production schema (Postgres)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Campaign Manager',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bu_registry (
  code                TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  active              BOOLEAN NOT NULL DEFAULT true,
  cms_integration     BOOLEAN NOT NULL DEFAULT false,
  drr_applicable      BOOLEAN NOT NULL DEFAULT false,
  advanced_settings   BOOLEAN NOT NULL DEFAULT false,
  default_geography   TEXT,
  owner_name          TEXT
);

CREATE TABLE IF NOT EXISTS whatsapp_channels (
  id                    TEXT PRIMARY KEY,
  label                 TEXT NOT NULL,
  phone_number          TEXT NOT NULL,
  business_unit         TEXT,
  wa_phone_number_id    TEXT,          -- Meta phone_number_id, set once real API is connected
  active                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wa_templates (
  id          TEXT PRIMARY KEY,
  body        TEXT NOT NULL,
  vars        JSONB NOT NULL DEFAULT '[]',
  approved    BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohorts (
  id           TEXT PRIMARY KEY,
  description  TEXT,
  creator_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS placements (
  id           SERIAL PRIMARY KEY,
  property     TEXT NOT NULL,
  platform     TEXT NOT NULL,
  rules        TEXT,
  backend_name TEXT NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS campaigns (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  business_unit TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',   -- draft | live | paused | at_risk | ended
  total_budget  NUMERIC NOT NULL DEFAULT 0,
  spend_mtd     NUMERIC NOT NULL DEFAULT 0,
  leads         INTEGER NOT NULL DEFAULT 0,
  channels      JSONB NOT NULL DEFAULT '[]',      -- ["Echo","DSP","WhatsApp"]
  form_data     JSONB NOT NULL,                    -- full CampaignFormData snapshot
  created_by    INTEGER REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  launched_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS whatsapp_test_sends (
  id           SERIAL PRIMARY KEY,
  channel_id   TEXT REFERENCES whatsapp_channels(id),
  phone        TEXT NOT NULL,
  template_id  TEXT NOT NULL,
  vars         JSONB NOT NULL DEFAULT '[]',
  simulated    BOOLEAN NOT NULL DEFAULT true,
  status       TEXT NOT NULL DEFAULT 'queued',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
