-- metricX — Schema inicial (Fase 1)
-- Empresa, Usuario (perfis), Aplicacao+Modulos, Documento+Secoes,
-- Contagem, Item da Contagem (FP SFP / FP Standard).
-- RLS: isolamento por empresa. Hierarquia Portfolio/Programa/Projeto e o
-- relacionamento N:N Cliente<->Fornecedor ficam para a Fase 2.

-- ============================================================
-- ENUMS
-- ============================================================

create type empresa_tipo as enum ('cliente', 'fornecedor');
create type perfil_usuario as enum ('administrador', 'executivo', 'gestor', 'analista');
create type tipo_desenvolvimento as enum ('interno', 'cots', 'externo');
create type contagem_tipo as enum ('desenvolvimento', 'melhoria', 'aplicacao');
create type contagem_modalidade as enum ('simples', 'detalhada');
create type contagem_status as enum ('nao_iniciada', 'em_andamento', 'concluida', 'cancelada');
create type funcao_projeto as enum ('nova', 'alterada', 'excluida', 'conversao');
create type subtipo_ifpug as enum ('ALI', 'AIE', 'EE', 'SE', 'CE');

-- ============================================================
-- FUNÇÃO utilitária: updated_at automático
-- ============================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- EMPRESA
-- ============================================================

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo empresa_tipo not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- USUARIO (vinculado a auth.users, com perfil e empresa)
-- ============================================================

create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  empresa_id uuid not null references public.empresas (id) on delete restrict,
  nome text not null,
  perfil perfil_usuario not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger usuarios_set_updated_at
  before update on public.usuarios
  for each row execute function public.set_updated_at();

-- Cadastro de usuário é centralizado pelo Administrador: ao criar o usuário
-- via supabase.auth.admin.createUser({ user_metadata: { empresa_id, nome, perfil } }),
-- este trigger espelha os dados em public.usuarios automaticamente.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.usuarios (id, empresa_id, nome, perfil)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'empresa_id')::uuid,
    coalesce(new.raw_user_meta_data ->> 'nome', new.email),
    coalesce((new.raw_user_meta_data ->> 'perfil')::perfil_usuario, 'analista')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funções auxiliares para RLS (security definer evita recursão em usuarios)
create function public.usuario_empresa_id()
returns uuid
language sql security definer stable set search_path = public
as $$
  select empresa_id from public.usuarios where id = auth.uid();
$$;

create function public.usuario_is_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.usuarios where id = auth.uid() and perfil = 'administrador'
  );
$$;

-- ============================================================
-- APLICACAO + MODULO
-- ============================================================

create table public.aplicacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  codigo text not null,
  nome text not null,
  area_funcional text,
  fronteira_codigo text,
  fronteira_nome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, codigo)
);

create trigger aplicacoes_set_updated_at
  before update on public.aplicacoes
  for each row execute function public.set_updated_at();

create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  aplicacao_id uuid not null references public.aplicacoes (id) on delete cascade,
  nome text not null,
  tipo_desenvolvimento tipo_desenvolvimento not null,
  ambiente_desenvolvimento text,
  linguagem_programacao text,
  observacoes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DOCUMENTO + SEÇÃO/SUB-SEÇÃO (1/2/3) — árvore auto-referenciada
-- ============================================================

create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  aplicacao_id uuid not null references public.aplicacoes (id) on delete cascade,
  codigo text not null,
  tipo_documento text not null,
  nome text not null,
  data_documento date,
  versao text,
  link_acesso text,
  created_at timestamptz not null default now(),
  unique (aplicacao_id, codigo)
);

-- nivel: 1 = Seção, 2 = Sub-seção 1, 3 = Sub-seção 2, 4 = Sub-seção 3
create table public.documento_secoes (
  id uuid primary key default gen_random_uuid(),
  documento_id uuid not null references public.documentos (id) on delete cascade,
  parent_id uuid references public.documento_secoes (id) on delete cascade,
  nivel smallint not null check (nivel between 1 and 4),
  numero text,
  nome text not null,
  observacao text,
  created_at timestamptz not null default now(),
  check ((nivel = 1 and parent_id is null) or (nivel > 1 and parent_id is not null))
);

create index documento_secoes_parent_id_idx on public.documento_secoes (parent_id);
create index documento_secoes_documento_id_idx on public.documento_secoes (documento_id);
create index modulos_aplicacao_id_idx on public.modulos (aplicacao_id);
create index documentos_aplicacao_id_idx on public.documentos (aplicacao_id);

-- ============================================================
-- CONTAGEM + ITEM DA CONTAGEM
-- ============================================================

create table public.contagens (
  id uuid primary key default gen_random_uuid(),
  aplicacao_id uuid not null references public.aplicacoes (id) on delete cascade,
  tipo contagem_tipo not null,
  modalidade contagem_modalidade not null,
  numero_versao text not null,
  status contagem_status not null default 'nao_iniciada',
  created_by uuid references public.usuarios (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (aplicacao_id, numero_versao)
);

create index contagens_aplicacao_id_idx on public.contagens (aplicacao_id);

create trigger contagens_set_updated_at
  before update on public.contagens
  for each row execute function public.set_updated_at();

create table public.itens_contagem (
  id uuid primary key default gen_random_uuid(),
  contagem_id uuid not null references public.contagens (id) on delete cascade,
  modulo_id uuid references public.modulos (id),
  id_funcao text not null,
  descricao text,
  funcao_projeto funcao_projeto not null,
  subtipo_ifpug subtipo_ifpug not null,
  -- FP SFP: valor fixo por categoria, independente da complexidade real
  -- (Função de Dados = 7,0 / Função de Transação = 4,6)
  fp_sfp numeric(6, 2) generated always as (
    case
      when subtipo_ifpug in ('ALI', 'AIE') then 7.0
      when subtipo_ifpug in ('EE', 'SE', 'CE') then 4.6
    end
  ) stored,
  -- FP Standard: preenchido no detalhamento (drill-down IFPUG, Fase 2)
  fp_standard numeric(6, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contagem_id, id_funcao)
);

create index itens_contagem_contagem_id_idx on public.itens_contagem (contagem_id);

create trigger itens_contagem_set_updated_at
  before update on public.itens_contagem
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — isolamento por empresa
-- Fase 1: qualquer usuário autenticado da empresa pode ler/escrever os
-- dados da própria empresa; regras finas por perfil (quem solicita,
-- quem conta, quem revisa) entram na Fase 2 junto com o fluxo de
-- governança Cliente <-> Fornecedor.
-- ============================================================

alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.aplicacoes enable row level security;
alter table public.modulos enable row level security;
alter table public.documentos enable row level security;
alter table public.documento_secoes enable row level security;
alter table public.contagens enable row level security;
alter table public.itens_contagem enable row level security;

-- empresas
create policy "empresas: select da própria empresa"
  on public.empresas for select
  using (id = public.usuario_empresa_id());

create policy "empresas: admin gerencia a própria empresa"
  on public.empresas for all
  using (public.usuario_is_admin() and id = public.usuario_empresa_id())
  with check (public.usuario_is_admin() and id = public.usuario_empresa_id());

-- usuarios
create policy "usuarios: select próprio registro ou colegas da empresa"
  on public.usuarios for select
  using (id = auth.uid() or empresa_id = public.usuario_empresa_id());

create policy "usuarios: admin gerencia usuarios da própria empresa"
  on public.usuarios for all
  using (public.usuario_is_admin() and empresa_id = public.usuario_empresa_id())
  with check (public.usuario_is_admin() and empresa_id = public.usuario_empresa_id());

-- aplicacoes
create policy "aplicacoes: acesso por empresa"
  on public.aplicacoes for all
  using (empresa_id = public.usuario_empresa_id())
  with check (empresa_id = public.usuario_empresa_id());

-- modulos (via aplicacao)
create policy "modulos: acesso por empresa"
  on public.modulos for all
  using (
    exists (
      select 1 from public.aplicacoes a
      where a.id = modulos.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from public.aplicacoes a
      where a.id = modulos.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  );

-- documentos (via aplicacao)
create policy "documentos: acesso por empresa"
  on public.documentos for all
  using (
    exists (
      select 1 from public.aplicacoes a
      where a.id = documentos.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from public.aplicacoes a
      where a.id = documentos.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  );

-- documento_secoes (via documento -> aplicacao)
create policy "documento_secoes: acesso por empresa"
  on public.documento_secoes for all
  using (
    exists (
      select 1 from public.documentos d
      join public.aplicacoes a on a.id = d.aplicacao_id
      where d.id = documento_secoes.documento_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from public.documentos d
      join public.aplicacoes a on a.id = d.aplicacao_id
      where d.id = documento_secoes.documento_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  );

-- contagens (via aplicacao)
create policy "contagens: acesso por empresa"
  on public.contagens for all
  using (
    exists (
      select 1 from public.aplicacoes a
      where a.id = contagens.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from public.aplicacoes a
      where a.id = contagens.aplicacao_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  );

-- itens_contagem (via contagem -> aplicacao)
create policy "itens_contagem: acesso por empresa"
  on public.itens_contagem for all
  using (
    exists (
      select 1 from public.contagens c
      join public.aplicacoes a on a.id = c.aplicacao_id
      where c.id = itens_contagem.contagem_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  )
  with check (
    exists (
      select 1 from public.contagens c
      join public.aplicacoes a on a.id = c.aplicacao_id
      where c.id = itens_contagem.contagem_id
        and a.empresa_id = public.usuario_empresa_id()
    )
  );
