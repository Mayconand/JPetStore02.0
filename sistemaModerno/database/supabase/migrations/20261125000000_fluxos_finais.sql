create or replace function jpetstore.fn_buscar_animais_filtrados(
    p_termo text default null,
    p_especie text default null,
    p_raca_id uuid default null,
    p_raca_nome text default null,
    p_preco_min numeric default null,
    p_preco_max numeric default null,
    p_idade text default null,
    p_limite integer default 12,
    p_offset integer default 0)
returns table (
    id uuid, nome text, especie text, raca_id uuid, raca text, data_nascimento date,
    sexo jpetstore.sexo_animal, castrado boolean, preco numeric, descricao text,
    imagem_url text, tags text[], total bigint)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    with filtro as (
        select nullif(fn_normalizar(btrim(p_termo)), '') as termo,
               nullif(upper(fn_normalizar(btrim(p_especie))), '') as especie,
               nullif(fn_normalizar(btrim(p_raca_nome)), '') as raca_nome
    ),
    filtrados as (
        select a.id, a.nome, a.especie, a.raca_id, r.nome as raca_nome, a.data_nascimento,
               a.sexo, a.castrado, a.preco, a.descricao
        from animal a
        join raca r on r.id = a.raca_id
        cross join filtro f
        where a.disponivel
          and (f.especie is null or a.especie = f.especie)
          and (p_raca_id is null or a.raca_id = p_raca_id)
          and (f.raca_nome is null or fn_normalizar(r.nome) = f.raca_nome)
          and (p_preco_min is null or a.preco >= p_preco_min)
          and (p_preco_max is null or a.preco <= p_preco_max)
          and (p_idade is null or (a.data_nascimento is not null and p_idade = case
                when a.data_nascimento > current_date - interval '1 year' then 'Filhote'
                when a.data_nascimento > current_date - interval '3 years' then 'Jovem'
                when a.data_nascimento > current_date - interval '8 years' then 'Adulto'
                else 'Idoso' end))
          and (f.termo is null
               or position(f.termo in fn_normalizar(a.nome)) > 0
               or position(f.termo in fn_normalizar(coalesce(a.descricao, ''))) > 0
               or position(f.termo in fn_normalizar(r.nome)) > 0
               or exists (select 1 from animal_tag at2 join tag t on t.id = at2.tag_id
                           where at2.animal_id = a.id and position(f.termo in fn_normalizar(t.nome)) > 0))
    )
    select x.id, x.nome, x.especie, x.raca_id, x.raca_nome, x.data_nascimento, x.sexo, x.castrado,
           x.preco, x.descricao,
           (select i.imagem_url from imagem_animal i where i.animal_id = x.id order by i.principal desc, i.ordem, i.imagem_url limit 1),
           coalesce((select array_agg(t.nome order by t.nome)
                       from animal_tag at2 join tag t on t.id = at2.tag_id
                      where at2.animal_id = x.id), '{}'::text[]),
           count(*) over ()
    from filtrados x
    order by x.nome, x.id
    limit greatest(coalesce(p_limite, 12), 1)
    offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function jpetstore.fn_buscar_animais(
    p_termo text default null,
    p_especie text default null,
    p_raca_id uuid default null,
    p_raca_nome text default null,
    p_preco_min numeric default null,
    p_preco_max numeric default null,
    p_limite integer default 12,
    p_offset integer default 0)
returns table (
    id uuid, nome text, especie text, raca_id uuid, raca text, data_nascimento date,
    sexo jpetstore.sexo_animal, castrado boolean, preco numeric, descricao text,
    imagem_url text, tags text[], total bigint)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select * from fn_buscar_animais_filtrados(p_termo, p_especie, p_raca_id, p_raca_nome,
                                             p_preco_min, p_preco_max, null, p_limite, p_offset);
$$;

create function jpetstore.fn_avancar_pedido(p_id uuid, p_status jpetstore.status_pedido)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_status status_pedido;
begin
    select status into v_status from pedido where id = p_id for update;
    if not found then
        raise exception using errcode = 'JP404', message = 'PEDIDO_NAO_ENCONTRADO', detail = 'Pedido não encontrado.';
    end if;
    if p_status in ('ENVIADO', 'ENTREGUE') and v_status = p_status then
        return;
    end if;
    if p_status is null or not (
       (v_status = 'PAGO' and p_status = 'ENVIADO') or (v_status = 'ENVIADO' and p_status = 'ENTREGUE')) then
        raise exception using errcode = 'JP409', message = 'TRANSICAO_INVALIDA', detail = 'O status do pedido não permite esta alteração.';
    end if;
    update pedido set status = p_status where id = p_id;
end;
$$;

alter table jpetstore.usuario add column versao_recuperacao uuid;

create table jpetstore.recuperacao_senha (
    usuario_id uuid primary key references jpetstore.usuario(id) on delete cascade,
    token_hash text not null unique,
    senha_anterior text not null,
    email text not null,
    criado_em timestamptz not null default now()
);

alter table jpetstore.recuperacao_senha enable row level security;
revoke all on jpetstore.recuperacao_senha from public;

create function jpetstore.fn_redefinir_senha(p_token_hash text, p_nova_senha text)
returns boolean
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_usuario uuid;
    v_senha_anterior text;
    v_email text;
begin
    delete from recuperacao_senha
    where token_hash = p_token_hash and criado_em > now() - interval '30 minutes'
    returning usuario_id, senha_anterior, email into v_usuario, v_senha_anterior, v_email;
    if not found then
        return false;
    end if;

    update usuario set senha_hash = p_nova_senha, atualizado_em = now(), versao_recuperacao = gen_random_uuid()
    where id = v_usuario and senha_hash = v_senha_anterior and email = v_email;
    return found;
end;
$$;

revoke all on function jpetstore.fn_redefinir_senha(text, text) from public;
revoke all on function jpetstore.fn_avancar_pedido(uuid, jpetstore.status_pedido) from public;
revoke all on function jpetstore.fn_buscar_animais_filtrados(text, text, uuid, text, numeric, numeric, text, integer, integer) from public;

create table jpetstore.favorito (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references jpetstore.usuario(id) on delete cascade,
    especie text not null check (especie in ('CACHORRO', 'GATO', 'REPTIL', 'PASSARO', 'PEIXE')),
    raca text not null check (char_length(btrim(raca)) between 1 and 120),
    criado_em timestamptz not null default now(),
    unique (usuario_id, especie, raca)
);

alter table jpetstore.favorito enable row level security;
revoke all on jpetstore.favorito from public;
