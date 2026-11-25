-- RF18 / RF19 / RF20: cada conta configura somente o próprio rodapé.
-- A configuração antiga continua sendo o padrão para contas sem personalização.
create table jpetstore.config_rodape_usuario (
    usuario_id     uuid primary key references jpetstore.usuario(id) on delete cascade,
    visivel        boolean not null default true,
    conteudo_html  text check (char_length(conteudo_html) <= 20000),
    atualizado_em  timestamptz not null default now()
);

alter table jpetstore.config_rodape_usuario enable row level security;

create or replace function jpetstore.fn_obter_rodape(p_usuario_id uuid)
returns json
language plpgsql
stable
set search_path = jpetstore, pg_temp
as $$
declare
    v_rodape json;
begin
    if not exists (select 1 from usuario where id = p_usuario_id) then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;

    select json_build_object('visivel', r.visivel, 'conteudoHtml', r.conteudo_html, 'atualizadoEm', r.atualizado_em)
      into v_rodape
      from config_rodape_usuario r where r.usuario_id = p_usuario_id;

    return coalesce(v_rodape, fn_obter_rodape());
end;
$$;

create or replace function jpetstore.fn_definir_visibilidade_rodape(p_usuario_id uuid, p_visivel boolean)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_atual json;
begin
    v_atual := fn_obter_rodape(p_usuario_id);
    insert into config_rodape_usuario (usuario_id, visivel, conteudo_html)
    values (p_usuario_id, p_visivel, v_atual ->> 'conteudoHtml')
    on conflict (usuario_id) do update set visivel = excluded.visivel, atualizado_em = now();
    return fn_obter_rodape(p_usuario_id);
end;
$$;

create or replace function jpetstore.fn_desabilitar_rodape(p_usuario_id uuid)
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    select fn_definir_visibilidade_rodape(p_usuario_id, false);
$$;

create or replace function jpetstore.fn_habilitar_rodape(p_usuario_id uuid)
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    select fn_definir_visibilidade_rodape(p_usuario_id, true);
$$;

create or replace function jpetstore.fn_personalizar_rodape(p_usuario_id uuid, p_conteudo_html text)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_atual json;
begin
    v_atual := fn_obter_rodape(p_usuario_id);
    insert into config_rodape_usuario (usuario_id, visivel, conteudo_html)
    values (p_usuario_id, (v_atual ->> 'visivel')::boolean, p_conteudo_html)
    on conflict (usuario_id) do update set conteudo_html = excluded.conteudo_html, atualizado_em = now();
    return fn_obter_rodape(p_usuario_id);
end;
$$;

-- Mesmo isolamento das migrations anteriores: acesso somente pelo backend.
revoke all on jpetstore.config_rodape_usuario from public;
revoke all on function jpetstore.fn_obter_rodape(uuid) from public;
revoke all on function jpetstore.fn_definir_visibilidade_rodape(uuid, boolean) from public;
revoke all on function jpetstore.fn_desabilitar_rodape(uuid) from public;
revoke all on function jpetstore.fn_habilitar_rodape(uuid) from public;
revoke all on function jpetstore.fn_personalizar_rodape(uuid, text) from public;
