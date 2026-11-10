-- =============================================================================
-- JPetStore — Funções de banco (uma ou mais por requisito funcional)
--
-- Convenção de erros: as funções levantam exceções com SQLSTATE "JPnnn", onde
-- nnn é o status HTTP equivalente, e a MESSAGE é um código estável em
-- MAIÚSCULAS (ex.: ANIMAL_INDISPONIVEL). O backend converte isso em resposta HTTP.
--   JP404 = não encontrado | JP409 = conflito | JP422 = regra de negócio violada
--
-- Autorização (cliente x administrador) é responsabilidade do backend;
-- as funções recebem o id do usuário já autenticado.
-- =============================================================================

set search_path to jpetstore;

-- -----------------------------------------------------------------------------
-- Utilitários
-- -----------------------------------------------------------------------------

-- Minúsculas e sem acentos, para buscas tolerantes (sem depender da extensão unaccent).
create or replace function jpetstore.fn_normalizar(p_texto text)
returns text
language sql
immutable
set search_path = jpetstore, pg_temp
as $$
    select lower(translate(p_texto,
        'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
        'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'));
$$;

create or replace function jpetstore.fn_texto(p_json jsonb, p_chave text)
returns text
language sql
immutable
set search_path = jpetstore, pg_temp
as $$
    select nullif(btrim(p_json ->> p_chave), '');
$$;

-- =============================================================================
-- RF01 — Visualizar Espécies
-- =============================================================================
create or replace function jpetstore.fn_listar_especies()
returns table (codigo text, nome text, descricao text, cuidados text, quantidade_disponivel bigint)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select e.codigo, e.nome, e.descricao, e.cuidados,
           (select count(*) from animal a where a.especie = e.codigo and a.disponivel)
    from especie e
    order by e.nome;
$$;

-- =============================================================================
-- RF15 / RF21 — Endereços (base usada também pelo cadastro de usuário)
-- =============================================================================
create or replace function jpetstore.fn_validar_endereco(p_endereco jsonb)
returns void
language plpgsql
immutable
set search_path = jpetstore, pg_temp
as $$
begin
    if p_endereco is null
       or fn_texto(p_endereco, 'cidade') is null
       or fn_texto(p_endereco, 'estado') is null
       or length(regexp_replace(coalesce(p_endereco ->> 'cep', ''), '\D', '', 'g')) <> 8 then
        raise exception using errcode = 'JP422', message = 'ENDERECO_INVALIDO',
            detail = 'Cidade, estado e CEP (8 dígitos) são obrigatórios.';
    end if;
end;
$$;

create or replace function jpetstore.fn_endereco_json(p_endereco jpetstore.endereco)
returns json
language sql
immutable
set search_path = jpetstore, pg_temp
as $$
    select json_build_object(
        'id', (p_endereco).id,
        'rua', (p_endereco).rua,
        'numero', (p_endereco).numero,
        'complemento', (p_endereco).complemento,
        'bairro', (p_endereco).bairro,
        'cidade', (p_endereco).cidade,
        'estado', (p_endereco).estado,
        'cep', (p_endereco).cep,
        'pais', (p_endereco).pais,
        'principal', (p_endereco).principal);
$$;

-- RF15 — Cadastrar Endereço de Entrega.
-- O primeiro endereço do usuário vira principal automaticamente.
-- p_principal = true torna este o novo principal (desmarcando o anterior).
create or replace function jpetstore.fn_cadastrar_endereco(p_usuario_id uuid, p_endereco jsonb, p_principal boolean default null)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_id uuid;
    v_principal boolean;
begin
    perform 1 from usuario u where u.id = p_usuario_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;

    perform fn_validar_endereco(p_endereco);

    v_principal := coalesce(p_principal, false)
                   or not exists (select 1 from endereco e where e.usuario_id = p_usuario_id);

    if v_principal then
        update endereco e set principal = false where e.usuario_id = p_usuario_id and e.principal;
    end if;

    insert into endereco (usuario_id, rua, numero, complemento, bairro, cidade, estado, cep, pais, principal)
    values (p_usuario_id,
            fn_texto(p_endereco, 'rua'),
            fn_texto(p_endereco, 'numero'),
            fn_texto(p_endereco, 'complemento'),
            fn_texto(p_endereco, 'bairro'),
            fn_texto(p_endereco, 'cidade'),
            fn_texto(p_endereco, 'estado'),
            regexp_replace(p_endereco ->> 'cep', '\D', '', 'g'),
            coalesce(fn_texto(p_endereco, 'pais'), 'Brasil'),
            v_principal)
    returning id into v_id;

    return v_id;
end;
$$;

-- RF21 — Cadastrar endereço alternativo (não altera o principal, exceto se for o primeiro).
create or replace function jpetstore.fn_cadastrar_endereco_alternativo(p_usuario_id uuid, p_endereco jsonb)
returns uuid
language sql
set search_path = jpetstore, pg_temp
as $$
    select fn_cadastrar_endereco(p_usuario_id, p_endereco, false);
$$;

create or replace function jpetstore.fn_listar_enderecos(p_usuario_id uuid)
returns json
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select coalesce(json_agg(fn_endereco_json(e) order by e.principal desc, e.criado_em), '[]'::json)
    from endereco e
    where e.usuario_id = p_usuario_id;
$$;

create or replace function jpetstore.fn_editar_endereco(p_usuario_id uuid, p_endereco_id uuid, p_endereco jsonb)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_endereco endereco;
begin
    perform fn_validar_endereco(p_endereco);

    update endereco e
       set rua = fn_texto(p_endereco, 'rua'),
           numero = fn_texto(p_endereco, 'numero'),
           complemento = fn_texto(p_endereco, 'complemento'),
           bairro = fn_texto(p_endereco, 'bairro'),
           cidade = fn_texto(p_endereco, 'cidade'),
           estado = fn_texto(p_endereco, 'estado'),
           cep = regexp_replace(p_endereco ->> 'cep', '\D', '', 'g'),
           pais = coalesce(fn_texto(p_endereco, 'pais'), 'Brasil')
     where e.id = p_endereco_id and e.usuario_id = p_usuario_id
    returning e.* into v_endereco;

    if v_endereco.id is null then
        raise exception using errcode = 'JP404', message = 'ENDERECO_NAO_ENCONTRADO';
    end if;

    return fn_endereco_json(v_endereco);
end;
$$;

-- Ao remover o principal, o endereço mais recente restante vira o novo principal.
create or replace function jpetstore.fn_remover_endereco(p_usuario_id uuid, p_endereco_id uuid)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_era_principal boolean;
begin
    delete from endereco e
     where e.id = p_endereco_id and e.usuario_id = p_usuario_id
    returning e.principal into v_era_principal;

    if v_era_principal is null then
        raise exception using errcode = 'JP404', message = 'ENDERECO_NAO_ENCONTRADO';
    end if;

    if v_era_principal then
        update endereco e set principal = true
         where e.id = (select e2.id from endereco e2
                        where e2.usuario_id = p_usuario_id
                        order by e2.criado_em desc, e2.id
                        limit 1);
    end if;
end;
$$;

create or replace function jpetstore.fn_definir_endereco_principal(p_usuario_id uuid, p_endereco_id uuid)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    perform 1 from endereco e where e.id = p_endereco_id and e.usuario_id = p_usuario_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'ENDERECO_NAO_ENCONTRADO';
    end if;

    update endereco e set principal = false where e.usuario_id = p_usuario_id and e.principal and e.id <> p_endereco_id;
    update endereco e set principal = true where e.id = p_endereco_id;
end;
$$;

-- =============================================================================
-- RF02 — Realizar Login (a senha é conferida no backend com BCrypt)
-- =============================================================================
create or replace function jpetstore.fn_buscar_usuario_login(p_email text)
returns table (id uuid, nome text, email text, senha_hash text, papel jpetstore.papel_usuario)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select u.id, u.nome, u.email, u.senha_hash, u.papel
    from usuario u
    where lower(u.email) = lower(btrim(p_email));
$$;

-- =============================================================================
-- RF03 — Realizar Cadastro
-- p_enderecos: array JSON; o primeiro vira o endereço principal.
-- =============================================================================
create or replace function jpetstore.fn_cadastrar_usuario(
    p_nome text,
    p_sobrenome text,
    p_email text,
    p_telefone text,
    p_senha_hash text,
    p_idioma text default 'pt-BR',
    p_preferencias jsonb default '{}'::jsonb,
    p_enderecos jsonb default '[]'::jsonb)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_id uuid;
    v_endereco jsonb;
begin
    if nullif(btrim(p_nome), '') is null or nullif(btrim(p_sobrenome), '') is null
       or nullif(btrim(p_email), '') is null or nullif(p_senha_hash, '') is null then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS',
            detail = 'Nome, sobrenome, email e senha são obrigatórios.';
    end if;

    if exists (select 1 from usuario u where lower(u.email) = lower(btrim(p_email))) then
        raise exception using errcode = 'JP409', message = 'EMAIL_JA_CADASTRADO';
    end if;

    if coalesce(p_idioma, 'pt-BR') not in ('pt-BR', 'en', 'es') then
        raise exception using errcode = 'JP422', message = 'IDIOMA_INVALIDO';
    end if;

    insert into usuario (nome, sobrenome, email, telefone, senha_hash, idioma_preferencial, preferencias)
    values (btrim(p_nome), btrim(p_sobrenome), lower(btrim(p_email)), nullif(btrim(p_telefone), ''),
            p_senha_hash, coalesce(p_idioma, 'pt-BR'), coalesce(p_preferencias, '{}'::jsonb))
    returning id into v_id;

    for v_endereco in select value from jsonb_array_elements(coalesce(p_enderecos, '[]'::jsonb)) loop
        perform fn_cadastrar_endereco(v_id, v_endereco);
    end loop;

    return v_id;
end;
$$;

-- =============================================================================
-- RF04 — Visualizar Perfil
-- =============================================================================
create or replace function jpetstore.fn_obter_perfil(p_usuario_id uuid)
returns json
language plpgsql
stable
set search_path = jpetstore, pg_temp
as $$
declare
    v_perfil json;
begin
    select json_build_object(
               'id', u.id,
               'nome', u.nome,
               'sobrenome', u.sobrenome,
               'email', u.email,
               'telefone', u.telefone,
               'papel', u.papel,
               'idiomaPreferencial', u.idioma_preferencial,
               'preferencias', u.preferencias,
               'enderecos', fn_listar_enderecos(u.id))
      into v_perfil
      from usuario u
     where u.id = p_usuario_id;

    if v_perfil is null then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;

    return v_perfil;
end;
$$;

-- =============================================================================
-- RF05 — Alterar Perfil (o papel nunca é alterado aqui)
-- =============================================================================
create or replace function jpetstore.fn_alterar_perfil(
    p_usuario_id uuid,
    p_nome text,
    p_sobrenome text,
    p_email text,
    p_telefone text,
    p_idioma text,
    p_preferencias jsonb default null)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    if nullif(btrim(p_nome), '') is null or nullif(btrim(p_sobrenome), '') is null
       or nullif(btrim(p_email), '') is null then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS',
            detail = 'Nome, sobrenome e email são obrigatórios.';
    end if;

    if coalesce(p_idioma, 'pt-BR') not in ('pt-BR', 'en', 'es') then
        raise exception using errcode = 'JP422', message = 'IDIOMA_INVALIDO';
    end if;

    if exists (select 1 from usuario u where lower(u.email) = lower(btrim(p_email)) and u.id <> p_usuario_id) then
        raise exception using errcode = 'JP409', message = 'EMAIL_JA_CADASTRADO';
    end if;

    update usuario u
       set nome = btrim(p_nome),
           sobrenome = btrim(p_sobrenome),
           email = lower(btrim(p_email)),
           telefone = nullif(btrim(p_telefone), ''),
           idioma_preferencial = coalesce(p_idioma, u.idioma_preferencial),
           preferencias = coalesce(p_preferencias, u.preferencias),
           atualizado_em = now()
     where u.id = p_usuario_id;

    if not found then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;

    return fn_obter_perfil(p_usuario_id);
end;
$$;

-- A senha atual é conferida no backend (BCrypt) antes de chamar esta função.
create or replace function jpetstore.fn_alterar_senha(p_usuario_id uuid, p_senha_hash text)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    update usuario u set senha_hash = p_senha_hash, atualizado_em = now() where u.id = p_usuario_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;
end;
$$;

-- =============================================================================
-- RF10 — Realizar Logout (revogação de tokens JWT)
-- =============================================================================
create or replace function jpetstore.fn_revogar_token(p_jti text, p_usuario_id uuid, p_expira_em timestamptz)
returns void
language sql
set search_path = jpetstore, pg_temp
as $$
    insert into token_revogado (jti, usuario_id, expira_em)
    values (p_jti, p_usuario_id, p_expira_em)
    on conflict (jti) do nothing;
$$;

create or replace function jpetstore.fn_token_revogado(p_jti text)
returns boolean
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select exists (select 1 from token_revogado t where t.jti = p_jti);
$$;

create or replace function jpetstore.fn_limpar_tokens_expirados()
returns integer
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_qtd integer;
begin
    delete from token_revogado t where t.expira_em < now();
    get diagnostics v_qtd = row_count;
    return v_qtd;
end;
$$;

-- =============================================================================
-- RF11 — Selecionar Idioma Preferencial
-- =============================================================================
create or replace function jpetstore.fn_selecionar_idioma(p_usuario_id uuid, p_idioma text)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    if p_idioma is null or p_idioma not in ('pt-BR', 'en', 'es') then
        raise exception using errcode = 'JP422', message = 'IDIOMA_INVALIDO';
    end if;

    update usuario u set idioma_preferencial = p_idioma, atualizado_em = now() where u.id = p_usuario_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'USUARIO_NAO_ENCONTRADO';
    end if;
end;
$$;

-- =============================================================================
-- RF07 — Buscar Animais (somente disponíveis; paginada; sem diferenciar acentos)
-- =============================================================================
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
          and (f.termo is null
               or position(f.termo in fn_normalizar(a.nome)) > 0
               or position(f.termo in fn_normalizar(coalesce(a.descricao, ''))) > 0
               or position(f.termo in fn_normalizar(r.nome)) > 0
               or exists (select 1 from animal_tag at2 join tag t on t.id = at2.tag_id
                           where at2.animal_id = a.id and position(f.termo in fn_normalizar(t.nome)) > 0))
    )
    select x.id, x.nome, x.especie, x.raca_id, x.raca_nome, x.data_nascimento, x.sexo, x.castrado,
           x.preco, x.descricao,
           (select i.imagem_url from imagem_animal i where i.animal_id = x.id order by i.imagem_url limit 1),
           coalesce((select array_agg(t.nome order by t.nome)
                       from animal_tag at2 join tag t on t.id = at2.tag_id
                      where at2.animal_id = x.id), '{}'::text[]),
           count(*) over ()
    from filtrados x
    order by x.nome, x.id
    limit greatest(coalesce(p_limite, 12), 1)
    offset greatest(coalesce(p_offset, 0), 0);
$$;

-- =============================================================================
-- RF16 — Visualizar Animal
-- =============================================================================
create or replace function jpetstore.fn_obter_animal(p_animal_id uuid)
returns json
language plpgsql
stable
set search_path = jpetstore, pg_temp
as $$
declare
    v_animal json;
begin
    select json_build_object(
               'id', a.id,
               'nome', a.nome,
               'especie', a.especie,
               'raca', json_build_object('id', r.id, 'nome', r.nome, 'descricao', r.descricao),
               'dataNascimento', a.data_nascimento,
               'sexo', a.sexo,
               'castrado', a.castrado,
               'descricao', a.descricao,
               'preco', a.preco,
               'disponivel', a.disponivel,
               'cuidados', e.cuidados,
               'atributos', case a.especie
                   when 'CACHORRO' then json_build_object('porte', c.porte)
                   when 'GATO'     then json_build_object('porte', g.porte, 'pelagem', g.pelagem)
                   when 'PASSARO'  then json_build_object('plumagem', pa.plumagem)
                   when 'PEIXE'    then json_build_object('tipoDeAgua', pe.tipo_de_agua, 'estirpe', pe.estirpe, 'ph', pe.ph)
                   when 'REPTIL'   then json_build_object('grupo', re.grupo, 'mutacao', re.mutacao)
               end,
               'imagens', coalesce((select json_agg(i.imagem_url order by i.imagem_url)
                                      from imagem_animal i where i.animal_id = a.id), '[]'::json),
               'tags', coalesce((select json_agg(t.nome order by t.nome)
                                   from animal_tag at2 join tag t on t.id = at2.tag_id
                                  where at2.animal_id = a.id), '[]'::json),
               'laudos', coalesce((select json_agg(json_build_object(
                                          'id', l.id, 'titulo', l.titulo, 'descricao', l.descricao,
                                          'dataEmissao', l.data_emissao, 'arquivoUrl', l.arquivo_url)
                                          order by l.data_emissao desc)
                                     from laudo l where l.animal_id = a.id), '[]'::json))
      into v_animal
      from animal a
      join raca r on r.id = a.raca_id
      join especie e on e.codigo = a.especie
      left join cachorro c on c.id = a.id
      left join gato g on g.id = a.id
      left join passaro pa on pa.id = a.id
      left join peixe pe on pe.id = a.id
      left join reptil re on re.id = a.id
     where a.id = p_animal_id;

    if v_animal is null then
        raise exception using errcode = 'JP404', message = 'ANIMAL_NAO_ENCONTRADO';
    end if;

    return v_animal;
end;
$$;

-- =============================================================================
-- RF17 — Buscar Tags
-- =============================================================================
create or replace function jpetstore.fn_buscar_tags(p_termo text default null)
returns table (id uuid, nome text)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select t.id, t.nome
    from tag t
    where nullif(btrim(p_termo), '') is null
       or position(fn_normalizar(btrim(p_termo)) in fn_normalizar(t.nome)) > 0
    order by t.nome;
$$;

-- =============================================================================
-- RF08 / RF09 / RF29 — Carrinho e cupom
-- =============================================================================
create or replace function jpetstore.fn_garantir_carrinho(p_usuario_id uuid)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_id uuid;
begin
    insert into carrinho (usuario_id) values (p_usuario_id)
    on conflict (usuario_id) do nothing;

    select c.id into v_id from carrinho c where c.usuario_id = p_usuario_id;
    return v_id;
end;
$$;

-- RF08 — Visualizar Carrinho. Itens indisponíveis aparecem marcados e não entram no total.
create or replace function jpetstore.fn_obter_carrinho(p_usuario_id uuid)
returns json
language plpgsql
stable
set search_path = jpetstore, pg_temp
as $$
declare
    v_carrinho carrinho;
    v_itens json;
    v_subtotal numeric(10, 2);
    v_codigo text;
    v_percentual numeric(5, 2);
    v_desconto numeric(10, 2) := 0;
begin
    select * into v_carrinho from carrinho c where c.usuario_id = p_usuario_id;

    select coalesce(json_agg(json_build_object(
                   'animalId', a.id,
                   'nome', a.nome,
                   'especie', a.especie,
                   'raca', r.nome,
                   'imagemUrl', (select i2.imagem_url from imagem_animal i2 where i2.animal_id = a.id
                                  order by i2.imagem_url limit 1),
                   'precoUnitario', i.preco_unitario,
                   'disponivel', a.disponivel) order by i.adicionado_em), '[]'::json),
           coalesce(sum(i.preco_unitario) filter (where a.disponivel), 0)
      into v_itens, v_subtotal
      from item_carrinho i
      join animal a on a.id = i.animal_id
      join raca r on r.id = a.raca_id
     where i.carrinho_id = v_carrinho.id;

    select cp.codigo, cp.percentual_desconto
      into v_codigo, v_percentual
      from cupom cp
     where cp.id = v_carrinho.cupom_id and cp.ativo and cp.data_validade >= current_date;

    if v_percentual is not null then
        v_desconto := round(v_subtotal * v_percentual / 100, 2);
    end if;

    return json_build_object(
        'id', v_carrinho.id,
        'itens', v_itens,
        'cupom', case when v_codigo is null then null
                      else json_build_object('codigo', v_codigo, 'percentualDesconto', v_percentual) end,
        'subtotal', v_subtotal,
        'desconto', v_desconto,
        'total', v_subtotal - v_desconto);
end;
$$;

-- RF09 — Atualizar Carrinho: adicionar (idempotente; sem quantidade).
create or replace function jpetstore.fn_adicionar_item_carrinho(p_usuario_id uuid, p_animal_id uuid)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_animal animal;
    v_carrinho_id uuid;
begin
    select * into v_animal from animal a where a.id = p_animal_id;
    if v_animal.id is null then
        raise exception using errcode = 'JP404', message = 'ANIMAL_NAO_ENCONTRADO';
    end if;
    if not v_animal.disponivel then
        raise exception using errcode = 'JP422', message = 'ANIMAL_INDISPONIVEL';
    end if;

    v_carrinho_id := fn_garantir_carrinho(p_usuario_id);

    insert into item_carrinho (carrinho_id, animal_id, preco_unitario)
    values (v_carrinho_id, p_animal_id, v_animal.preco)
    on conflict (carrinho_id, animal_id) do nothing;

    update carrinho c set atualizado_em = now() where c.id = v_carrinho_id;

    return fn_obter_carrinho(p_usuario_id);
end;
$$;

-- RF09 — Atualizar Carrinho: remover.
create or replace function jpetstore.fn_remover_item_carrinho(p_usuario_id uuid, p_animal_id uuid)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    delete from item_carrinho i
     using carrinho c
     where c.id = i.carrinho_id and c.usuario_id = p_usuario_id and i.animal_id = p_animal_id;

    if not found then
        raise exception using errcode = 'JP404', message = 'ITEM_NAO_ENCONTRADO';
    end if;

    update carrinho c set atualizado_em = now() where c.usuario_id = p_usuario_id;
    return fn_obter_carrinho(p_usuario_id);
end;
$$;

-- RF09 — Atualizar Carrinho: esvaziar.
create or replace function jpetstore.fn_limpar_carrinho(p_usuario_id uuid)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    delete from item_carrinho i using carrinho c
     where c.id = i.carrinho_id and c.usuario_id = p_usuario_id;
    update carrinho c set cupom_id = null, atualizado_em = now() where c.usuario_id = p_usuario_id;
    return fn_obter_carrinho(p_usuario_id);
end;
$$;

-- RF29 — Inserir Cupom Promocional (administrador).
create or replace function jpetstore.fn_inserir_cupom(p_codigo text, p_percentual numeric, p_data_validade date)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_id uuid;
begin
    if nullif(btrim(p_codigo), '') is null or p_percentual is null or p_percentual <= 0 or p_percentual > 100
       or p_data_validade is null or p_data_validade < current_date then
        raise exception using errcode = 'JP422', message = 'CUPOM_INVALIDO',
            detail = 'Código obrigatório, percentual entre 0 e 100 e validade a partir de hoje.';
    end if;

    if exists (select 1 from cupom c where upper(c.codigo) = upper(btrim(p_codigo))) then
        raise exception using errcode = 'JP409', message = 'CUPOM_JA_EXISTE';
    end if;

    insert into cupom (codigo, percentual_desconto, data_validade)
    values (upper(btrim(p_codigo)), p_percentual, p_data_validade)
    returning id into v_id;

    return v_id;
end;
$$;

-- RF29 — Aplicar cupom ao carrinho (cliente).
create or replace function jpetstore.fn_aplicar_cupom_carrinho(p_usuario_id uuid, p_codigo text)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_cupom_id uuid;
    v_carrinho_id uuid;
begin
    select c.id into v_cupom_id
      from cupom c
     where upper(c.codigo) = upper(btrim(p_codigo)) and c.ativo and c.data_validade >= current_date;

    if v_cupom_id is null then
        raise exception using errcode = 'JP422', message = 'CUPOM_INVALIDO';
    end if;

    -- Precisa ser um comando separado: o UPDATE não enxerga um carrinho criado no próprio WHERE.
    v_carrinho_id := fn_garantir_carrinho(p_usuario_id);
    update carrinho c set cupom_id = v_cupom_id, atualizado_em = now() where c.id = v_carrinho_id;

    return fn_obter_carrinho(p_usuario_id);
end;
$$;

create or replace function jpetstore.fn_remover_cupom_carrinho(p_usuario_id uuid)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    update carrinho c set cupom_id = null, atualizado_em = now() where c.usuario_id = p_usuario_id;
    return fn_obter_carrinho(p_usuario_id);
end;
$$;

-- =============================================================================
-- RF06 / RF12 — Pedidos
-- =============================================================================
create or replace function jpetstore.fn_pedido_json(p_pedido_id uuid)
returns json
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select json_build_object(
        'id', p.id,
        'dataCriacao', p.data_criacao,
        'status', p.status,
        'modalidade', p.modalidade,
        'enderecoEntrega', case when p.modalidade = 'ENTREGA' then json_build_object(
                'rua', p.entrega_rua, 'numero', p.entrega_numero, 'complemento', p.entrega_complemento,
                'bairro', p.entrega_bairro, 'cidade', p.entrega_cidade, 'estado', p.entrega_estado,
                'cep', p.entrega_cep, 'pais', p.entrega_pais) end,
        'cupom', (select c.codigo from cupom c where c.id = p.cupom_id),
        'valorItens', p.valor_itens,
        'valorDesconto', p.valor_desconto,
        'valorTotal', p.valor_total,
        'canceladoEm', p.cancelado_em,
        'itens', coalesce((select json_agg(json_build_object(
                        'animalId', i.animal_id,
                        'nome', i.nome_animal,
                        'precoUnitario', i.preco_unitario,
                        'imagemUrl', (select im.imagem_url from imagem_animal im where im.animal_id = i.animal_id
                                       order by im.imagem_url limit 1)) order by i.nome_animal)
                     from item_pedido i where i.pedido_id = p.id), '[]'::json))
    from pedido p
    where p.id = p_pedido_id;
$$;

-- RF06 — Visualizar Pedidos (lista resumida, mais recentes primeiro).
create or replace function jpetstore.fn_listar_pedidos_usuario(p_usuario_id uuid)
returns json
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select coalesce(json_agg(json_build_object(
               'id', p.id,
               'dataCriacao', p.data_criacao,
               'status', p.status,
               'modalidade', p.modalidade,
               'valorTotal', p.valor_total,
               'quantidadeItens', (select count(*) from item_pedido i where i.pedido_id = p.id))
               order by p.data_criacao desc), '[]'::json)
    from pedido p
    where p.usuario_id = p_usuario_id;
$$;

-- RF06 — Detalhe de um pedido do próprio usuário.
create or replace function jpetstore.fn_obter_pedido(p_usuario_id uuid, p_pedido_id uuid)
returns json
language plpgsql
stable
set search_path = jpetstore, pg_temp
as $$
begin
    perform 1 from pedido p where p.id = p_pedido_id and p.usuario_id = p_usuario_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'PEDIDO_NAO_ENCONTRADO';
    end if;
    return fn_pedido_json(p_pedido_id);
end;
$$;

-- Criar Pedido a partir do carrinho (base do RF12 — Finalizar Compra).
-- Tudo numa transação: valida, cria o pedido com cópia do endereço, torna os
-- animais indisponíveis, remove-os de todos os carrinhos e esvazia o carrinho.
create or replace function jpetstore.fn_criar_pedido(
    p_usuario_id uuid,
    p_modalidade jpetstore.modalidade_entrega,
    p_endereco_id uuid default null)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_carrinho carrinho;
    v_endereco endereco;
    v_qtd integer;
    v_indisponiveis integer;
    v_valor_itens numeric(10, 2);
    v_cupom_id uuid;
    v_percentual numeric(5, 2);
    v_desconto numeric(10, 2) := 0;
    v_pedido_id uuid;
begin
    if p_modalidade is null then
        raise exception using errcode = 'JP422', message = 'MODALIDADE_OBRIGATORIA';
    end if;

    select * into v_carrinho from carrinho c where c.usuario_id = p_usuario_id for update;

    select count(*) into v_qtd from item_carrinho i where i.carrinho_id = v_carrinho.id;
    if v_carrinho.id is null or v_qtd = 0 then
        raise exception using errcode = 'JP422', message = 'CARRINHO_VAZIO';
    end if;

    -- Trava os animais para evitar que dois clientes comprem o mesmo animal ao mesmo tempo.
    perform 1 from animal a
     where a.id in (select i.animal_id from item_carrinho i where i.carrinho_id = v_carrinho.id)
     order by a.id
     for update;

    select count(*) into v_indisponiveis
      from item_carrinho i join animal a on a.id = i.animal_id
     where i.carrinho_id = v_carrinho.id and not a.disponivel;
    if v_indisponiveis > 0 then
        raise exception using errcode = 'JP409', message = 'ANIMAL_INDISPONIVEL',
            detail = 'Remova do carrinho os animais que não estão mais disponíveis.';
    end if;

    if p_modalidade = 'ENTREGA' then
        if p_endereco_id is null then
            raise exception using errcode = 'JP422', message = 'ENDERECO_OBRIGATORIO';
        end if;

        select * into v_endereco from endereco e where e.id = p_endereco_id and e.usuario_id = p_usuario_id;
        if v_endereco.id is null then
            raise exception using errcode = 'JP404', message = 'ENDERECO_NAO_ENCONTRADO';
        end if;
        if v_endereco.rua is null or v_endereco.numero is null then
            raise exception using errcode = 'JP422', message = 'ENDERECO_INCOMPLETO',
                detail = 'Rua e número são obrigatórios para entrega.';
        end if;
    end if;

    select sum(i.preco_unitario) into v_valor_itens from item_carrinho i where i.carrinho_id = v_carrinho.id;

    select cp.id, cp.percentual_desconto into v_cupom_id, v_percentual
      from cupom cp
     where cp.id = v_carrinho.cupom_id and cp.ativo and cp.data_validade >= current_date;
    if v_percentual is not null then
        v_desconto := round(v_valor_itens * v_percentual / 100, 2);
    end if;

    insert into pedido (usuario_id, modalidade, endereco_id,
                        entrega_rua, entrega_numero, entrega_complemento, entrega_bairro,
                        entrega_cidade, entrega_estado, entrega_cep, entrega_pais,
                        cupom_id, valor_itens, valor_desconto, valor_total)
    values (p_usuario_id, p_modalidade, v_endereco.id,
            v_endereco.rua, v_endereco.numero, v_endereco.complemento, v_endereco.bairro,
            v_endereco.cidade, v_endereco.estado, v_endereco.cep, v_endereco.pais,
            v_cupom_id, v_valor_itens, v_desconto, v_valor_itens - v_desconto)
    returning id into v_pedido_id;

    insert into item_pedido (pedido_id, animal_id, nome_animal, preco_unitario)
    select v_pedido_id, a.id, a.nome, i.preco_unitario
      from item_carrinho i join animal a on a.id = i.animal_id
     where i.carrinho_id = v_carrinho.id;

    update animal a set disponivel = false
     where a.id in (select ip.animal_id from item_pedido ip where ip.pedido_id = v_pedido_id);

    -- Remove os animais vendidos de TODOS os carrinhos (inclusive o deste usuário).
    delete from item_carrinho i
     where i.animal_id in (select ip.animal_id from item_pedido ip where ip.pedido_id = v_pedido_id);

    update carrinho c set cupom_id = null, atualizado_em = now() where c.id = v_carrinho.id;

    return v_pedido_id;
end;
$$;

-- Cancelar Pedido: só o dono, e só antes do envio. Os animais voltam a ficar disponíveis.
create or replace function jpetstore.fn_cancelar_pedido(p_usuario_id uuid, p_pedido_id uuid)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_status status_pedido;
begin
    select p.status into v_status
      from pedido p
     where p.id = p_pedido_id and p.usuario_id = p_usuario_id
       for update;

    if v_status is null then
        raise exception using errcode = 'JP404', message = 'PEDIDO_NAO_ENCONTRADO';
    end if;
    if v_status not in ('AGUARDANDO_PAGAMENTO', 'PAGO') then
        raise exception using errcode = 'JP422', message = 'PEDIDO_NAO_CANCELAVEL',
            detail = 'Somente pedidos aguardando pagamento ou pagos podem ser cancelados.';
    end if;

    update pedido p set status = 'CANCELADO', cancelado_em = now() where p.id = p_pedido_id;

    update animal a set disponivel = true
     where a.id in (select i.animal_id from item_pedido i where i.pedido_id = p_pedido_id);

    return fn_pedido_json(p_pedido_id);
end;
$$;

-- =============================================================================
-- RF13 — Cadastrar Cartão (guarda apenas os 4 últimos dígitos)
-- =============================================================================
create or replace function jpetstore.fn_cadastrar_cartao(
    p_usuario_id uuid,
    p_numero text,
    p_nome_titular text,
    p_data_validade text,
    p_bandeira text)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_digitos text := regexp_replace(coalesce(p_numero, ''), '\D', '', 'g');
    v_id uuid;
begin
    if length(v_digitos) not between 13 and 19
       or nullif(btrim(p_nome_titular), '') is null
       or nullif(btrim(p_bandeira), '') is null
       or coalesce(p_data_validade, '') !~ '^(0[1-9]|1[0-2])/[0-9]{2}$' then
        raise exception using errcode = 'JP422', message = 'CARTAO_INVALIDO';
    end if;

    if (to_date('01/' || p_data_validade, 'DD/MM/YY') + interval '1 month') <= current_date then
        raise exception using errcode = 'JP422', message = 'CARTAO_VENCIDO';
    end if;

    insert into cartao (usuario_id, nome_titular, ultimos_digitos, bandeira, data_validade)
    values (p_usuario_id, btrim(p_nome_titular), right(v_digitos, 4), btrim(p_bandeira), p_data_validade)
    returning id into v_id;

    return v_id;
end;
$$;

-- =============================================================================
-- RF14 — Realizar Pagamento (simulado: sempre aprovado)
-- =============================================================================
create or replace function jpetstore.fn_realizar_pagamento(
    p_usuario_id uuid,
    p_pedido_id uuid,
    p_forma jpetstore.forma_pagamento,
    p_cartao_id uuid default null)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_pedido pedido;
    v_pagamento_id uuid;
begin
    select * into v_pedido from pedido p where p.id = p_pedido_id and p.usuario_id = p_usuario_id for update;
    if v_pedido.id is null then
        raise exception using errcode = 'JP404', message = 'PEDIDO_NAO_ENCONTRADO';
    end if;
    if v_pedido.status <> 'AGUARDANDO_PAGAMENTO' then
        raise exception using errcode = 'JP422', message = 'PEDIDO_NAO_AGUARDA_PAGAMENTO';
    end if;

    if p_forma = 'CARTAO_CREDITO' then
        perform 1 from cartao c where c.id = p_cartao_id and c.usuario_id = p_usuario_id;
        if not found then
            raise exception using errcode = 'JP422', message = 'CARTAO_OBRIGATORIO';
        end if;
    end if;

    insert into pagamento (pedido_id, cartao_id, forma, valor, status)
    values (p_pedido_id, case when p_forma = 'CARTAO_CREDITO' then p_cartao_id end, p_forma,
            v_pedido.valor_total, 'APROVADO')
    returning id into v_pagamento_id;

    update pedido p set status = 'PAGO' where p.id = p_pedido_id;

    return v_pagamento_id;
end;
$$;

-- =============================================================================
-- RF18 / RF19 / RF20 — Rodapé
-- =============================================================================
create or replace function jpetstore.fn_obter_rodape()
returns json
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select coalesce(
        (select json_build_object('visivel', r.visivel, 'conteudoHtml', r.conteudo_html, 'atualizadoEm', r.atualizado_em)
           from config_rodape r where r.id = 1),
        json_build_object('visivel', true, 'conteudoHtml', null, 'atualizadoEm', null));
$$;

create or replace function jpetstore.fn_definir_visibilidade_rodape(p_visivel boolean)
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    insert into config_rodape (id, visivel) values (1, p_visivel)
    on conflict (id) do update set visivel = excluded.visivel, atualizado_em = now();
    select fn_obter_rodape();
$$;

-- RF18
create or replace function jpetstore.fn_desabilitar_rodape()
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    select fn_definir_visibilidade_rodape(false);
$$;

-- RF19
create or replace function jpetstore.fn_habilitar_rodape()
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    select fn_definir_visibilidade_rodape(true);
$$;

-- RF20
create or replace function jpetstore.fn_personalizar_rodape(p_conteudo_html text)
returns json
language sql
set search_path = jpetstore, pg_temp
as $$
    insert into config_rodape (id, conteudo_html) values (1, p_conteudo_html)
    on conflict (id) do update set conteudo_html = excluded.conteudo_html, atualizado_em = now();
    select fn_obter_rodape();
$$;

-- =============================================================================
-- RF22 — Acessar informações de ajuda
-- =============================================================================
create or replace function jpetstore.fn_listar_ajuda(p_termo text default null)
returns table (id uuid, titulo text, conteudo text)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select t.id, t.titulo, t.conteudo
    from topico_ajuda t
    where nullif(btrim(p_termo), '') is null
       or position(fn_normalizar(btrim(p_termo)) in fn_normalizar(t.titulo || ' ' || t.conteudo)) > 0
    order by t.ordem, t.titulo;
$$;

-- =============================================================================
-- RF23 / RF24 / RF26 / RF27 / RF28 — Administração de animais
-- =============================================================================

-- RF24 — Cadastrar Raça
create or replace function jpetstore.fn_cadastrar_raca(p_especie text, p_nome text, p_descricao text default null)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_especie text := upper(fn_normalizar(btrim(p_especie)));
    v_id uuid;
begin
    perform 1 from especie e where e.codigo = v_especie;
    if not found then
        raise exception using errcode = 'JP422', message = 'ESPECIE_INVALIDA';
    end if;
    if nullif(btrim(p_nome), '') is null then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS', detail = 'Nome da raça é obrigatório.';
    end if;
    if exists (select 1 from raca r where r.especie = v_especie and lower(r.nome) = lower(btrim(p_nome))) then
        raise exception using errcode = 'JP409', message = 'RACA_JA_CADASTRADA';
    end if;

    insert into raca (especie, nome, descricao)
    values (v_especie, btrim(p_nome), nullif(btrim(p_descricao), ''))
    returning id into v_id;

    return v_id;
end;
$$;

create or replace function jpetstore.fn_definir_tags_animal(p_animal_id uuid, p_tags jsonb)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_nome text;
    v_tag_id uuid;
begin
    delete from animal_tag at2 where at2.animal_id = p_animal_id;

    for v_nome in select btrim(value) from jsonb_array_elements_text(coalesce(p_tags, '[]'::jsonb)) loop
        continue when v_nome = '';
        insert into tag (nome) values (v_nome) on conflict ((lower(nome))) do nothing;
        select t.id into v_tag_id from tag t where lower(t.nome) = lower(v_nome);
        insert into animal_tag (animal_id, tag_id) values (p_animal_id, v_tag_id) on conflict do nothing;
    end loop;
end;
$$;

create or replace function jpetstore.fn_definir_imagens_animal(p_animal_id uuid, p_imagens jsonb)
returns void
language sql
set search_path = jpetstore, pg_temp
as $$
    delete from imagem_animal i where i.animal_id = p_animal_id;
    insert into imagem_animal (animal_id, imagem_url)
    select p_animal_id, btrim(value)
      from jsonb_array_elements_text(coalesce(p_imagens, '[]'::jsonb))
     where btrim(value) <> '';
$$;

-- RF26 (apoio) — Cadastrar laudo de um animal
create or replace function jpetstore.fn_cadastrar_laudo(
    p_animal_id uuid, p_titulo text, p_descricao text default null,
    p_data_emissao date default current_date, p_arquivo_url text default null)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_id uuid;
begin
    perform 1 from animal a where a.id = p_animal_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'ANIMAL_NAO_ENCONTRADO';
    end if;
    if nullif(btrim(p_titulo), '') is null then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS', detail = 'Título do laudo é obrigatório.';
    end if;

    insert into laudo (animal_id, titulo, descricao, data_emissao, arquivo_url)
    values (p_animal_id, btrim(p_titulo), p_descricao, coalesce(p_data_emissao, current_date), p_arquivo_url)
    returning id into v_id;
    return v_id;
end;
$$;

-- RF23 — Cadastrar Animal.
-- p_dados: { racaId, nome, preco, dataNascimento, descricao, sexo, castrado, disponivel,
--            porte, pelagem, plumagem, tipoDeAgua, estirpe, ph, grupo, mutacao,
--            imagens: [url], tags: [nome], laudos: [{titulo, descricao, dataEmissao, arquivoUrl}] }
create or replace function jpetstore.fn_cadastrar_animal(p_especie text, p_dados jsonb)
returns uuid
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_especie text := upper(fn_normalizar(btrim(p_especie)));
    v_raca_id uuid := (p_dados ->> 'racaId')::uuid;
    v_id uuid;
    v_laudo jsonb;
begin
    perform 1 from especie e where e.codigo = v_especie;
    if not found then
        raise exception using errcode = 'JP422', message = 'ESPECIE_INVALIDA';
    end if;

    perform 1 from raca r where r.id = v_raca_id and r.especie = v_especie;
    if not found then
        raise exception using errcode = 'JP422', message = 'RACA_INVALIDA',
            detail = 'A raça precisa existir e pertencer à mesma espécie do animal.';
    end if;

    if fn_texto(p_dados, 'nome') is null or (p_dados ->> 'preco') is null or (p_dados ->> 'preco')::numeric < 0 then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS', detail = 'Nome e preço são obrigatórios.';
    end if;

    insert into animal (especie, raca_id, nome, data_nascimento, descricao, sexo, castrado, preco, disponivel)
    values (v_especie, v_raca_id, fn_texto(p_dados, 'nome'),
            (p_dados ->> 'dataNascimento')::date,
            fn_texto(p_dados, 'descricao'),
            (fn_texto(p_dados, 'sexo'))::sexo_animal,
            coalesce((p_dados ->> 'castrado')::boolean, false),
            (p_dados ->> 'preco')::numeric,
            coalesce((p_dados ->> 'disponivel')::boolean, true))
    returning id into v_id;

    case v_especie
        when 'CACHORRO' then
            insert into cachorro (id, porte) values (v_id, fn_texto(p_dados, 'porte'));
        when 'GATO' then
            insert into gato (id, porte, pelagem) values (v_id, fn_texto(p_dados, 'porte'), fn_texto(p_dados, 'pelagem'));
        when 'PASSARO' then
            insert into passaro (id, plumagem) values (v_id, fn_texto(p_dados, 'plumagem'));
        when 'PEIXE' then
            insert into peixe (id, tipo_de_agua, estirpe, ph)
            values (v_id, fn_texto(p_dados, 'tipoDeAgua'), fn_texto(p_dados, 'estirpe'), (p_dados ->> 'ph')::double precision);
        when 'REPTIL' then
            insert into reptil (id, grupo, mutacao) values (v_id, fn_texto(p_dados, 'grupo'), fn_texto(p_dados, 'mutacao'));
    end case;

    perform fn_definir_imagens_animal(v_id, p_dados -> 'imagens');
    perform fn_definir_tags_animal(v_id, p_dados -> 'tags');

    for v_laudo in select value from jsonb_array_elements(coalesce(p_dados -> 'laudos', '[]'::jsonb)) loop
        perform fn_cadastrar_laudo(v_id, fn_texto(v_laudo, 'titulo'), fn_texto(v_laudo, 'descricao'),
                                   (v_laudo ->> 'dataEmissao')::date, fn_texto(v_laudo, 'arquivoUrl'));
    end loop;

    return v_id;
end;
$$;

-- RF27 — Editar Animais. Só altera as chaves presentes em p_dados (a espécie não muda).
create or replace function jpetstore.fn_editar_animal(p_animal_id uuid, p_dados jsonb)
returns json
language plpgsql
set search_path = jpetstore, pg_temp
as $$
declare
    v_animal animal;
begin
    select * into v_animal from animal a where a.id = p_animal_id for update;
    if v_animal.id is null then
        raise exception using errcode = 'JP404', message = 'ANIMAL_NAO_ENCONTRADO';
    end if;

    if p_dados ? 'racaId' then
        perform 1 from raca r where r.id = (p_dados ->> 'racaId')::uuid and r.especie = v_animal.especie;
        if not found then
            raise exception using errcode = 'JP422', message = 'RACA_INVALIDA';
        end if;
    end if;

    if p_dados ? 'preco' and coalesce((p_dados ->> 'preco')::numeric, -1) < 0 then
        raise exception using errcode = 'JP422', message = 'DADOS_INVALIDOS', detail = 'Preço inválido.';
    end if;

    update animal a set
        raca_id         = case when p_dados ? 'racaId' then (p_dados ->> 'racaId')::uuid else a.raca_id end,
        nome            = coalesce(fn_texto(p_dados, 'nome'), a.nome),
        data_nascimento = case when p_dados ? 'dataNascimento' then (p_dados ->> 'dataNascimento')::date else a.data_nascimento end,
        descricao       = case when p_dados ? 'descricao' then fn_texto(p_dados, 'descricao') else a.descricao end,
        sexo            = case when p_dados ? 'sexo' then (fn_texto(p_dados, 'sexo'))::sexo_animal else a.sexo end,
        castrado        = coalesce((p_dados ->> 'castrado')::boolean, a.castrado),
        preco           = coalesce((p_dados ->> 'preco')::numeric, a.preco),
        disponivel      = coalesce((p_dados ->> 'disponivel')::boolean, a.disponivel)
    where a.id = p_animal_id;

    case v_animal.especie
        when 'CACHORRO' then
            update cachorro c set porte = case when p_dados ? 'porte' then fn_texto(p_dados, 'porte') else c.porte end
             where c.id = p_animal_id;
        when 'GATO' then
            update gato g set porte   = case when p_dados ? 'porte' then fn_texto(p_dados, 'porte') else g.porte end,
                              pelagem = case when p_dados ? 'pelagem' then fn_texto(p_dados, 'pelagem') else g.pelagem end
             where g.id = p_animal_id;
        when 'PASSARO' then
            update passaro pa set plumagem = case when p_dados ? 'plumagem' then fn_texto(p_dados, 'plumagem') else pa.plumagem end
             where pa.id = p_animal_id;
        when 'PEIXE' then
            update peixe pe set tipo_de_agua = case when p_dados ? 'tipoDeAgua' then fn_texto(p_dados, 'tipoDeAgua') else pe.tipo_de_agua end,
                                estirpe      = case when p_dados ? 'estirpe' then fn_texto(p_dados, 'estirpe') else pe.estirpe end,
                                ph           = case when p_dados ? 'ph' then (p_dados ->> 'ph')::double precision else pe.ph end
             where pe.id = p_animal_id;
        when 'REPTIL' then
            update reptil re set grupo   = case when p_dados ? 'grupo' then fn_texto(p_dados, 'grupo') else re.grupo end,
                                 mutacao = case when p_dados ? 'mutacao' then fn_texto(p_dados, 'mutacao') else re.mutacao end
             where re.id = p_animal_id;
    end case;

    if p_dados ? 'imagens' then
        perform fn_definir_imagens_animal(p_animal_id, p_dados -> 'imagens');
    end if;
    if p_dados ? 'tags' then
        perform fn_definir_tags_animal(p_animal_id, p_dados -> 'tags');
    end if;

    return fn_obter_animal(p_animal_id);
end;
$$;

-- RF28 — Excluir Animais. Animais que já fazem parte de pedidos não podem ser
-- apagados (o histórico precisa deles); nesse caso, marque-os como indisponíveis.
create or replace function jpetstore.fn_excluir_animal(p_animal_id uuid)
returns void
language plpgsql
set search_path = jpetstore, pg_temp
as $$
begin
    if exists (select 1 from item_pedido i where i.animal_id = p_animal_id) then
        raise exception using errcode = 'JP409', message = 'ANIMAL_POSSUI_PEDIDOS',
            detail = 'Animais com pedidos não podem ser excluídos; marque-os como indisponíveis.';
    end if;

    delete from animal a where a.id = p_animal_id;
    if not found then
        raise exception using errcode = 'JP404', message = 'ANIMAL_NAO_ENCONTRADO';
    end if;
end;
$$;

-- RF26 — Ver Laudos
create or replace function jpetstore.fn_listar_laudos(p_animal_id uuid)
returns table (id uuid, titulo text, descricao text, data_emissao date, arquivo_url text)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select l.id, l.titulo, l.descricao, l.data_emissao, l.arquivo_url
    from laudo l
    where l.animal_id = p_animal_id
    order by l.data_emissao desc, l.titulo;
$$;

-- =============================================================================
-- RF25 — Ver Clientes (que realizaram pedidos)
-- =============================================================================
create or replace function jpetstore.fn_listar_clientes()
returns table (
    id uuid, nome text, sobrenome text, email text, telefone text,
    quantidade_pedidos bigint, valor_total_gasto numeric, ultimo_pedido timestamptz)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select u.id, u.nome, u.sobrenome, u.email, u.telefone,
           count(p.id),
           coalesce(sum(p.valor_total) filter (where p.status <> 'CANCELADO'), 0),
           max(p.data_criacao)
    from usuario u
    join pedido p on p.usuario_id = u.id
    group by u.id
    order by max(p.data_criacao) desc;
$$;

-- =============================================================================
-- RF30 — Filtrar pedidos (status, período e/ou cliente). Datas inclusivas.
-- =============================================================================
create or replace function jpetstore.fn_filtrar_pedidos(
    p_status jpetstore.status_pedido default null,
    p_data_inicio date default null,
    p_data_fim date default null,
    p_usuario_id uuid default null)
returns table (
    id uuid, usuario_id uuid, cliente text, email text, data_criacao timestamptz,
    status jpetstore.status_pedido, modalidade jpetstore.modalidade_entrega,
    valor_total numeric, quantidade_itens bigint)
language sql
stable
set search_path = jpetstore, pg_temp
as $$
    select p.id, u.id, u.nome || ' ' || u.sobrenome, u.email, p.data_criacao, p.status, p.modalidade,
           p.valor_total, (select count(*) from item_pedido i where i.pedido_id = p.id)
    from pedido p
    join usuario u on u.id = p.usuario_id
    where (p_status is null or p.status = p_status)
      and (p_data_inicio is null or p.data_criacao >= p_data_inicio)
      and (p_data_fim is null or p.data_criacao < p_data_fim + 1)
      and (p_usuario_id is null or p.usuario_id = p_usuario_id)
    order by p.data_criacao desc;
$$;

-- -----------------------------------------------------------------------------
-- Segurança: ninguém além do dono (backend) executa as funções.
-- -----------------------------------------------------------------------------
revoke all on all functions in schema jpetstore from public;
