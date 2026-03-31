-- PantryClip MVP schema (PostgreSQL)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_type') THEN
    CREATE TYPE source_type AS ENUM ('youtube_shorts', 'instagram_reels', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'summary_source') THEN
    CREATE TYPE summary_source AS ENUM ('manual', 'ai');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_type source_type NOT NULL,
  title VARCHAR(140) NOT NULL,
  ingredients_text TEXT NOT NULL,
  steps_text TEXT NOT NULL,
  summary_source summary_source NOT NULL,
  ai_confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recipes_ai_confidence_range
    CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1))
);

CREATE INDEX IF NOT EXISTS idx_recipes_user_created_id_desc
  ON recipes (user_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_recipes_user_lower_title
  ON recipes (user_id, lower(title));
