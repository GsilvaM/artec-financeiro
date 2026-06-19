-- ============================================================
-- BOOTSTRAP: Tabela de controle de migrations
-- Execute este SQL uma vez no SQL Editor do Supabase Dashboard
-- (https://supabase.com/dashboard/project/uglhjopqcoduncgumuzs/sql/new)
-- ============================================================

CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  hash TEXT NOT NULL DEFAULT '',
  applied_at TIMESTAMPTZ DEFAULT now()
);
