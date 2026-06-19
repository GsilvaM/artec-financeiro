-- 1. Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  especialidade TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_tecnicos_nome ON tecnicos (nome);
CREATE INDEX IF NOT EXISTS idx_tecnicos_ativo ON tecnicos (ativo);

-- 2. Serviços
CREATE TABLE IF NOT EXISTS servicos (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  cliente TEXT NOT NULL,
  tecnico TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  data DATE NOT NULL,
  valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'agendado'
);

CREATE INDEX IF NOT EXISTS idx_servicos_data ON servicos (data);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos (status);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos (cliente);

-- 3. Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT '',
  departamento TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores (nome);
CREATE INDEX IF NOT EXISTS idx_colaboradores_departamento ON colaboradores (departamento);
CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo ON colaboradores (ativo);

-- 4. Catálogo de Serviços
CREATE TABLE IF NOT EXISTS servicos_cadastro (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  valor NUMERIC(12, 2) NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_servicos_cadastro_nome ON servicos_cadastro (nome);
CREATE INDEX IF NOT EXISTS idx_servicos_cadastro_categoria ON servicos_cadastro (categoria);

-- 5. Metas
CREATE TABLE IF NOT EXISTS metas (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  descricao TEXT NOT NULL,
  valor_meta NUMERIC(12, 2) NOT NULL DEFAULT 0,
  valor_atual NUMERIC(12, 2) NOT NULL DEFAULT 0,
  periodo TEXT NOT NULL DEFAULT '',
  tipo TEXT NOT NULL DEFAULT 'mensal'
);

CREATE INDEX IF NOT EXISTS idx_metas_periodo ON metas (periodo);
CREATE INDEX IF NOT EXISTS idx_metas_tipo ON metas (tipo);

-- 6. Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  nome TEXT NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  ativo BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios (username);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios (role);

-- 7. Permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'user',
  recurso TEXT NOT NULL,
  leitura BOOLEAN NOT NULL DEFAULT true,
  escrita BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (role, recurso)
);

CREATE INDEX IF NOT EXISTS idx_permissoes_role ON permissoes (role);
CREATE INDEX IF NOT EXISTS idx_permissoes_recurso ON permissoes (recurso);
