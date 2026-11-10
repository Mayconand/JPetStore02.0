-- =============================================================================
-- JPetStore — Schema do sistema moderno
--
-- Tudo fica no schema "jpetstore", que NÃO é exposto pela API REST do Supabase
-- (PostgREST expõe apenas "public"). O acesso é feito somente pelo backend Java.
-- RLS fica habilitado em todas as tabelas, sem políticas: qualquer acesso pelos
-- papéis anon/authenticated do Supabase é negado. O dono das tabelas (usado pelo
-- backend) não é afetado pelo RLS.
-- =============================================================================

create schema if not exists jpetstore;

set search_path to jpetstore;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type jpetstore.papel_usuario      as enum ('CLIENTE', 'ADMIN');
create type jpetstore.status_pedido      as enum ('AGUARDANDO_PAGAMENTO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');
create type jpetstore.modalidade_entrega as enum ('RETIRADA', 'ENTREGA');
create type jpetstore.sexo_animal        as enum ('MACHO', 'FEMEA');
create type jpetstore.forma_pagamento    as enum ('CARTAO_CREDITO', 'PIX', 'BOLETO');
create type jpetstore.status_pagamento   as enum ('APROVADO', 'RECUSADO', 'ESTORNADO');

-- -----------------------------------------------------------------------------
-- Catálogo
-- -----------------------------------------------------------------------------
create table jpetstore.especie (
    codigo    text primary key check (codigo in ('CACHORRO', 'GATO', 'PASSARO', 'PEIXE', 'REPTIL')),
    nome      text not null,
    descricao text,
    cuidados  text            -- RNF07: orientações de alimentação, habitat e cuidados
);

create table jpetstore.raca (
    id        uuid primary key default gen_random_uuid(),
    especie   text not null references jpetstore.especie (codigo),
    nome      text not null,
    descricao text,
    unique (id, especie)       -- alvo da FK composta em animal (garante raça da mesma espécie)
);
create unique index raca_especie_nome_uk on jpetstore.raca (especie, lower(nome));

create table jpetstore.animal (
    id              uuid primary key default gen_random_uuid(),
    especie         text not null references jpetstore.especie (codigo),
    raca_id         uuid not null,
    nome            text not null,
    data_nascimento date,
    descricao       text,
    sexo            jpetstore.sexo_animal,
    castrado        boolean not null default false,
    preco           numeric(10, 2) not null check (preco >= 0),
    disponivel      boolean not null default true,
    criado_em       timestamptz not null default now(),
    foreign key (raca_id, especie) references jpetstore.raca (id, especie)
);
create index animal_disponivel_especie_idx on jpetstore.animal (especie) where disponivel;
create index animal_raca_idx on jpetstore.animal (raca_id);

create table jpetstore.cachorro (
    id    uuid primary key references jpetstore.animal (id) on delete cascade,
    porte text check (porte in ('PEQUENO', 'MEDIO', 'GRANDE'))
);

create table jpetstore.gato (
    id      uuid primary key references jpetstore.animal (id) on delete cascade,
    porte   text check (porte in ('PEQUENO', 'MEDIO', 'GRANDE')),
    pelagem text
);

create table jpetstore.passaro (
    id        uuid primary key references jpetstore.animal (id) on delete cascade,
    plumagem  text
);

create table jpetstore.peixe (
    id           uuid primary key references jpetstore.animal (id) on delete cascade,
    tipo_de_agua text check (tipo_de_agua in ('SALGADA', 'DOCE')),
    estirpe      text,
    ph           double precision check (ph between 0 and 14)
);

create table jpetstore.reptil (
    id      uuid primary key references jpetstore.animal (id) on delete cascade,
    grupo   text check (grupo in ('SERPENTES', 'LAGARTOS', 'QUELONIOS', 'CROCODILIANOS')),
    mutacao text
);

create table jpetstore.imagem_animal (
    id         uuid primary key default gen_random_uuid(),
    animal_id  uuid not null references jpetstore.animal (id) on delete cascade,
    imagem_url text not null
);
create index imagem_animal_animal_idx on jpetstore.imagem_animal (animal_id);

create table jpetstore.laudo (
    id            uuid primary key default gen_random_uuid(),
    animal_id     uuid not null references jpetstore.animal (id) on delete cascade,
    titulo        text not null,
    descricao     text,
    data_emissao  date not null default current_date,
    arquivo_url   text
);
create index laudo_animal_idx on jpetstore.laudo (animal_id);

create table jpetstore.tag (
    id   uuid primary key default gen_random_uuid(),
    nome text not null
);
create unique index tag_nome_uk on jpetstore.tag (lower(nome));

create table jpetstore.animal_tag (
    animal_id uuid not null references jpetstore.animal (id) on delete cascade,
    tag_id    uuid not null references jpetstore.tag (id) on delete cascade,
    primary key (animal_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- Usuários, autenticação e endereços
-- -----------------------------------------------------------------------------
create table jpetstore.usuario (
    id                   uuid primary key default gen_random_uuid(),
    nome                 text not null,
    sobrenome            text not null,
    email                text not null,
    telefone             text,
    senha_hash           text not null,
    papel                jpetstore.papel_usuario not null default 'CLIENTE',
    idioma_preferencial  text not null default 'pt-BR' check (idioma_preferencial in ('pt-BR', 'en', 'es')),
    preferencias         jsonb not null default '{}'::jsonb,
    criado_em            timestamptz not null default now(),
    atualizado_em        timestamptz not null default now()
);
create unique index usuario_email_uk on jpetstore.usuario (lower(email));

create table jpetstore.token_revogado (
    jti         text primary key,
    usuario_id  uuid references jpetstore.usuario (id) on delete cascade,
    expira_em   timestamptz not null,
    revogado_em timestamptz not null default now()
);
create index token_revogado_expira_idx on jpetstore.token_revogado (expira_em);

-- Endereço único: serve tanto para entrega quanto para cobrança.
create table jpetstore.endereco (
    id          uuid primary key default gen_random_uuid(),
    usuario_id  uuid not null references jpetstore.usuario (id) on delete cascade,
    rua         text,
    numero      text,
    complemento text,
    bairro      text,
    cidade      text not null,
    estado      text not null,
    cep         text not null,
    pais        text not null default 'Brasil',
    principal   boolean not null default false,
    criado_em   timestamptz not null default now()
);
create index endereco_usuario_idx on jpetstore.endereco (usuario_id);
-- Exatamente um endereço principal por usuário (no máximo um aqui; "pelo menos um" é garantido pelas funções).
create unique index endereco_principal_uk on jpetstore.endereco (usuario_id) where principal;

-- -----------------------------------------------------------------------------
-- Cupom, carrinho e pedido
-- -----------------------------------------------------------------------------
create table jpetstore.cupom (
    id                    uuid primary key default gen_random_uuid(),
    codigo                text not null,
    percentual_desconto   numeric(5, 2) not null check (percentual_desconto > 0 and percentual_desconto <= 100),
    data_validade         date not null,
    ativo                 boolean not null default true
);
create unique index cupom_codigo_uk on jpetstore.cupom (upper(codigo));

create table jpetstore.carrinho (
    id            uuid primary key default gen_random_uuid(),
    usuario_id    uuid not null unique references jpetstore.usuario (id) on delete cascade,
    cupom_id      uuid references jpetstore.cupom (id) on delete set null,
    criado_em     timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

-- Cada Animal é um indivíduo único: sem quantidade.
create table jpetstore.item_carrinho (
    id              uuid primary key default gen_random_uuid(),
    carrinho_id     uuid not null references jpetstore.carrinho (id) on delete cascade,
    animal_id       uuid not null references jpetstore.animal (id) on delete cascade,
    preco_unitario  numeric(10, 2) not null,
    adicionado_em   timestamptz not null default now(),
    unique (carrinho_id, animal_id)
);
create index item_carrinho_animal_idx on jpetstore.item_carrinho (animal_id);

create table jpetstore.pedido (
    id                 uuid primary key default gen_random_uuid(),
    usuario_id         uuid not null references jpetstore.usuario (id),
    data_criacao       timestamptz not null default now(),
    status             jpetstore.status_pedido not null default 'AGUARDANDO_PAGAMENTO',
    modalidade         jpetstore.modalidade_entrega not null,
    -- Referência ao endereço escolhido (pode ser apagado depois) ...
    endereco_id        uuid references jpetstore.endereco (id) on delete set null,
    -- ... e cópia imutável do endereço no momento da compra.
    entrega_rua         text,
    entrega_numero      text,
    entrega_complemento text,
    entrega_bairro      text,
    entrega_cidade      text,
    entrega_estado      text,
    entrega_cep         text,
    entrega_pais        text,
    cupom_id           uuid references jpetstore.cupom (id) on delete set null,
    valor_itens        numeric(10, 2) not null,
    valor_desconto     numeric(10, 2) not null default 0,
    valor_total        numeric(10, 2) not null,
    cancelado_em       timestamptz,
    check (modalidade = 'RETIRADA' or (entrega_rua is not null and entrega_numero is not null and entrega_cidade is not null))
);
create index pedido_usuario_idx on jpetstore.pedido (usuario_id, data_criacao desc);
create index pedido_status_idx on jpetstore.pedido (status, data_criacao desc);

create table jpetstore.item_pedido (
    id              uuid primary key default gen_random_uuid(),
    pedido_id       uuid not null references jpetstore.pedido (id) on delete cascade,
    animal_id       uuid not null references jpetstore.animal (id),
    nome_animal     text not null,
    preco_unitario  numeric(10, 2) not null
);
create index item_pedido_pedido_idx on jpetstore.item_pedido (pedido_id);
create index item_pedido_animal_idx on jpetstore.item_pedido (animal_id);

-- -----------------------------------------------------------------------------
-- Pagamento
-- Por segurança (PCI/LGPD) o número completo do cartão NUNCA é armazenado.
-- -----------------------------------------------------------------------------
create table jpetstore.cartao (
    id               uuid primary key default gen_random_uuid(),
    usuario_id       uuid not null references jpetstore.usuario (id) on delete cascade,
    nome_titular     text not null,
    ultimos_digitos  char(4) not null,
    bandeira         text not null,
    data_validade    text not null check (data_validade ~ '^(0[1-9]|1[0-2])/[0-9]{2}$'),
    criado_em        timestamptz not null default now()
);
create index cartao_usuario_idx on jpetstore.cartao (usuario_id);

create table jpetstore.pagamento (
    id              uuid primary key default gen_random_uuid(),
    pedido_id       uuid not null references jpetstore.pedido (id),
    cartao_id       uuid references jpetstore.cartao (id) on delete set null,
    forma           jpetstore.forma_pagamento not null,
    valor           numeric(10, 2) not null,
    status          jpetstore.status_pagamento not null,
    data_pagamento  timestamptz not null default now()
);
create index pagamento_pedido_idx on jpetstore.pagamento (pedido_id);

-- -----------------------------------------------------------------------------
-- Conteúdo institucional
-- -----------------------------------------------------------------------------
create table jpetstore.config_rodape (
    id             int primary key default 1 check (id = 1),   -- linha única
    visivel        boolean not null default true,
    conteudo_html  text,
    atualizado_em  timestamptz not null default now()
);

create table jpetstore.topico_ajuda (
    id        uuid primary key default gen_random_uuid(),
    titulo    text not null,
    conteudo  text not null,
    ordem     int not null default 0
);

-- -----------------------------------------------------------------------------
-- Segurança: RLS em todas as tabelas (sem políticas = nega anon/authenticated)
-- -----------------------------------------------------------------------------
do $$
declare
    t record;
begin
    for t in select tablename from pg_tables where schemaname = 'jpetstore' loop
        execute format('alter table jpetstore.%I enable row level security', t.tablename);
    end loop;
end
$$;

revoke all on schema jpetstore from public;
