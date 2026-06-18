-- ============================================================
-- MIGRAÇÃO: De JSON blob para tabelas relacionais
-- Projeto: Artec Financeiro
-- ============================================================

-- 1. TABELA: lancamentos
-- Armazena cada lançamento financeiro como uma linha independente.
CREATE TABLE IF NOT EXISTS lancamentos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  data DATE NOT NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  contraparte TEXT NOT NULL DEFAULT '',
  valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente'
);

-- Índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos (data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos (tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos (status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria ON lancamentos (categoria);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo_data ON lancamentos (tipo, data);

-- 2. TABELA: categorias
-- Cada categoria é uma linha com tipo (grupo) e nome.
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE (tipo, nome)
);

CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias (tipo);

-- 3. MIGRAÇÃO DE DADOS EXISTENTES
-- Extrai lancamentos do JSON blob da tabela app_data para a tabela lancamentos.
INSERT INTO lancamentos (id, data, tipo, categoria, descricao, contraparte, valor, status, created_at)
SELECT
  (jsonb_array_elements(app_data.data->'lancamentos')->>'id')::TEXT,
  (jsonb_array_elements(app_data.data->'lancamentos')->>'data')::DATE,
  (jsonb_array_elements(app_data.data->'lancamentos')->>'tipo')::TEXT,
  (jsonb_array_elements(app_data.data->'lancamentos')->>'categoria')::TEXT,
  (jsonb_array_elements(app_data.data->'lancamentos')->>'descricao')::TEXT,
  COALESCE((jsonb_array_elements(app_data.data->'lancamentos')->>'contraparte')::TEXT, ''),
  (jsonb_array_elements(app_data.data->'lancamentos')->>'valor')::NUMERIC,
  COALESCE((jsonb_array_elements(app_data.data->'lancamentos')->>'status')::TEXT, 'pendente'),
  now()
FROM app_data
WHERE id = 'financeiro_store'
ON CONFLICT (id) DO NOTHING;

-- Extrai categorias do JSON blob para a tabela categorias.
WITH categorias_data AS (
  SELECT
    key AS tipo,
    jsonb_array_elements_text(value) AS nome
  FROM app_data,
       jsonb_each(app_data.data->'categorias')
  WHERE id = 'financeiro_store'
)
INSERT INTO categorias (tipo, nome)
SELECT DISTINCT tipo, nome
FROM categorias_data
ON CONFLICT (tipo, nome) DO NOTHING;

-- 4. REMOVER TABELA ANTIGA (opcional, após validar migração)
-- DROP TABLE IF EXISTS app_data;
