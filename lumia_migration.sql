-- ============================================================
-- LUMIA 2026 — Database Migratie
-- Voer dit uit in de Insforge SQL Editor
-- ============================================================

-- Trust Meters (1 row per user per project)
CREATE TABLE IF NOT EXISTS lumia_meters (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  user_id       TEXT NOT NULL,
  honor         INTEGER NOT NULL DEFAULT 50,
  reflectie     INTEGER NOT NULL DEFAULT 10,
  vitality      INTEGER NOT NULL DEFAULT 50,
  decay         INTEGER NOT NULL DEFAULT 5,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- XP Log
CREATE TABLE IF NOT EXISTS lumia_xp_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  user_id       TEXT NOT NULL,
  action        TEXT NOT NULL,
  xp            INTEGER NOT NULL,
  category      TEXT NOT NULL DEFAULT 'social',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Statements (stellingen)
CREATE TABLE IF NOT EXISTS lumia_statements (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  text          TEXT NOT NULL,
  option_0      TEXT NOT NULL,
  option_1      TEXT NOT NULL,
  option_2      TEXT NOT NULL,
  votes_0       NUMERIC NOT NULL DEFAULT 0,
  votes_1       NUMERIC NOT NULL DEFAULT 0,
  votes_2       NUMERIC NOT NULL DEFAULT 0,
  author        TEXT NOT NULL,
  author_id     TEXT NOT NULL,
  anonymous     BOOLEAN NOT NULL DEFAULT false,
  link          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Statement votes
CREATE TABLE IF NOT EXISTS lumia_statement_votes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  statement_id  UUID NOT NULL REFERENCES lumia_statements(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  option_index  INTEGER NOT NULL,
  trust_weight  NUMERIC NOT NULL DEFAULT 0.5,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, statement_id, user_id)
);

-- Friends
CREATE TABLE IF NOT EXISTS lumia_friends (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  user_id       TEXT NOT NULL,
  friend_id     TEXT NOT NULL,
  friend_name   TEXT NOT NULL,
  friend_avatar TEXT NOT NULL DEFAULT '🌿',
  honor         INTEGER NOT NULL DEFAULT 50,
  vitality      INTEGER NOT NULL DEFAULT 50,
  is_online     BOOLEAN NOT NULL DEFAULT false,
  xp            INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id, friend_id)
);

-- Friend requests
CREATE TABLE IF NOT EXISTS lumia_friend_requests (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  from_user_id  TEXT NOT NULL,
  to_user_id    TEXT NOT NULL,
  from_name     TEXT NOT NULL,
  from_avatar   TEXT NOT NULL DEFAULT '🌿',
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, from_user_id, to_user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS lumia_messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  chat_id       TEXT NOT NULL,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT NOT NULL,
  text          TEXT NOT NULL,
  xp_gift       INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS lumia_notifications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    TEXT NOT NULL DEFAULT 'LUMIA_2026',
  user_id       TEXT NOT NULL,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  read          BOOLEAN NOT NULL DEFAULT false,
  data          JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lumia_meters_project_user ON lumia_meters(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_lumia_xp_log_project_user ON lumia_xp_log(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_lumia_statements_project ON lumia_statements(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lumia_statement_votes_project ON lumia_statement_votes(project_id, statement_id);
CREATE INDEX IF NOT EXISTS idx_lumia_notifications_project_user ON lumia_notifications(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_lumia_messages_chat ON lumia_messages(project_id, chat_id);
