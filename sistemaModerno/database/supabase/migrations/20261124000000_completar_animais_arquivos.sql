-- Completa o contrato de arquivos e medidas usado pelo backend RF21–RF30.
-- Aplicar depois das três migrations originais; preserva animais e links existentes.
alter table jpetstore.cachorro add column altura numeric(6,2) check (altura > 0), add column peso numeric(7,3) check (peso > 0);
alter table jpetstore.gato add column altura numeric(6,2) check (altura > 0), add column peso numeric(7,3) check (peso > 0);
alter table jpetstore.reptil add column altura numeric(6,2) check (altura > 0), add column peso numeric(7,3) check (peso > 0);
alter table jpetstore.peixe add column expectativa_de_vida text;

create table jpetstore.arquivo (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    tipo_conteudo text not null check (tipo_conteudo in ('image/png','image/jpeg','image/webp','application/pdf')),
    conteudo bytea not null
);
alter table jpetstore.arquivo enable row level security;
alter table jpetstore.pedido add column endereco_cobranca jsonb;
alter table jpetstore.imagem_animal
    add column principal boolean not null default false,
    add column ordem integer not null default 0,
    add column arquivo_id uuid unique references jpetstore.arquivo(id);
alter table jpetstore.laudo add column arquivo_id uuid unique references jpetstore.arquivo(id);

with posicoes as (
    select id, row_number() over (partition by animal_id order by imagem_url, id) as posicao
    from jpetstore.imagem_animal
)
update jpetstore.imagem_animal i set principal = p.posicao = 1, ordem = p.posicao - 1
from posicoes p where p.id = i.id;
create unique index imagem_animal_principal_uk on jpetstore.imagem_animal(animal_id) where principal;

-- Arquivos acompanham a exclusão/substituição de sua imagem ou laudo, inclusive em cascata.
create function jpetstore.fn_limpar_arquivo_removido() returns trigger language plpgsql
set search_path = jpetstore, pg_temp as $$
begin
    if old.arquivo_id is not null then
        delete from arquivo a where a.id = old.arquivo_id
          and not exists (select 1 from imagem_animal i where i.arquivo_id = a.id)
          and not exists (select 1 from laudo l where l.arquivo_id = a.id);
    end if;
    return old;
end;
$$;
create trigger imagem_arquivo_removido after delete on jpetstore.imagem_animal
for each row execute function jpetstore.fn_limpar_arquivo_removido();
create trigger laudo_arquivo_removido after delete on jpetstore.laudo
for each row execute function jpetstore.fn_limpar_arquivo_removido();

create function jpetstore.fn_adicionar_imagem_animal(
    p_animal_id uuid, p_principal boolean, p_nome text, p_tipo text, p_conteudo bytea)
returns uuid language plpgsql set search_path = jpetstore, pg_temp as $$
declare v_id uuid := gen_random_uuid(); v_arquivo uuid; v_ordem integer;
begin
    perform 1 from animal where id = p_animal_id for update;
    if not found then raise exception using errcode='JP404', message='ANIMAL_NAO_ENCONTRADO'; end if;
    if p_principal then
        delete from imagem_animal where animal_id = p_animal_id and principal;
    elsif (select count(*) from imagem_animal where animal_id = p_animal_id and not principal) >= 3 then
        raise exception using errcode='JP422', message='LIMITE_DE_FOTOS', detail='Use uma imagem principal e até três fotos adicionais.';
    end if;
    select coalesce(max(ordem),0)+1 into v_ordem from imagem_animal where animal_id = p_animal_id;
    insert into arquivo(nome,tipo_conteudo,conteudo) values(p_nome,p_tipo,p_conteudo) returning id into v_arquivo;
    insert into imagem_animal(id,animal_id,imagem_url,principal,ordem,arquivo_id)
    values(v_id,p_animal_id,'/api/animais/imagens/'||v_id,p_principal,v_ordem,v_arquivo);
    return v_id;
end;
$$;

create function jpetstore.fn_adicionar_laudo_arquivo(p_animal_id uuid,p_titulo text,p_nome text,p_conteudo bytea)
returns uuid language plpgsql set search_path = jpetstore, pg_temp as $$
declare v_id uuid := gen_random_uuid(); v_arquivo uuid;
begin
    perform 1 from animal where id = p_animal_id for update;
    if not found then raise exception using errcode='JP404', message='ANIMAL_NAO_ENCONTRADO'; end if;
    insert into arquivo(nome,tipo_conteudo,conteudo) values(p_nome,'application/pdf',p_conteudo) returning id into v_arquivo;
    insert into laudo(id,animal_id,titulo,arquivo_url,arquivo_id)
    values(v_id,p_animal_id,p_titulo,'/api/laudos/'||v_id||'/arquivo',v_arquivo);
    return v_id;
end;
$$;

create function jpetstore.fn_obter_arquivo_imagem(p_id uuid)
returns table(nome text,tipo_conteudo text,conteudo bytea) language sql stable
set search_path = jpetstore, pg_temp as $$
    select a.nome,a.tipo_conteudo,a.conteudo from imagem_animal i join arquivo a on a.id=i.arquivo_id where i.id=p_id;
$$;
create function jpetstore.fn_obter_arquivo_laudo(p_id uuid)
returns table(nome text,tipo_conteudo text,conteudo bytea) language sql stable
set search_path = jpetstore, pg_temp as $$
    select a.nome,a.tipo_conteudo,a.conteudo from laudo l join arquivo a on a.id=l.arquivo_id where l.id=p_id;
$$;

create or replace function jpetstore.fn_definir_imagens_animal(p_animal_id uuid,p_imagens jsonb)
returns void language plpgsql set search_path = jpetstore, pg_temp as $$
begin
    perform 1 from animal where id=p_animal_id for update;
    if not found then raise exception using errcode='JP404', message='ANIMAL_NAO_ENCONTRADO'; end if;
    if jsonb_array_length(coalesce(p_imagens,'[]'::jsonb)) > 4 then
        raise exception using errcode='JP422', message='LIMITE_DE_FOTOS';
    end if;
    delete from imagem_animal where animal_id=p_animal_id;
    insert into imagem_animal(animal_id,imagem_url,principal,ordem)
    select p_animal_id,url,posicao=1,posicao-1 from (
        select btrim(value) as url,row_number() over(order by ordinalidade)::integer as posicao
        from jsonb_array_elements_text(coalesce(p_imagens,'[]'::jsonb)) with ordinality as imagens(value,ordinalidade)
        where btrim(value)<>''
    ) imagens;
end;
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
                   when 'CACHORRO' then json_build_object('altura', c.altura, 'peso', c.peso, 'porte', c.porte)
                   when 'GATO'     then json_build_object('altura', g.altura, 'peso', g.peso, 'porte', g.porte, 'pelagem', g.pelagem)
                   when 'PASSARO'  then json_build_object('plumagem', pa.plumagem)
                   when 'PEIXE'    then json_build_object('tipoDeAgua', pe.tipo_de_agua, 'estirpe', pe.estirpe, 'ph', pe.ph, 'expectativaDeVida', pe.expectativa_de_vida)
                   when 'REPTIL'   then json_build_object('altura', re.altura, 'peso', re.peso, 'grupo', re.grupo, 'mutacao', re.mutacao)
               end,
               'imagens', coalesce((select json_agg(i.imagem_url order by i.principal desc, i.ordem, i.imagem_url)
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
                                  order by i2.principal desc, i2.ordem, i2.imagem_url limit 1),
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
        'enderecoCobranca', coalesce(p.endereco_cobranca, case when p.modalidade = 'ENTREGA' then jsonb_build_object(
            'rua',p.entrega_rua,'numero',p.entrega_numero,'complemento',p.entrega_complemento,
            'bairro',p.entrega_bairro,'cidade',p.entrega_cidade,'estado',p.entrega_estado,'cep',p.entrega_cep,'pais',p.entrega_pais) end),
        'pagamento', (select json_build_object('forma',pg.forma,'status',pg.status,'valor',pg.valor,
            'dataPagamento',pg.data_pagamento,'bandeira',c.bandeira,'ultimosDigitos',c.ultimos_digitos)
            from pagamento pg left join cartao c on c.id=pg.cartao_id
            where pg.pedido_id=p.id order by pg.data_pagamento desc,pg.id limit 1),
        'cupom', (select c.codigo from cupom c where c.id = p.cupom_id),
        'valorItens', p.valor_itens,
        'valorDesconto', p.valor_desconto,
        'valorTotal', p.valor_total,
        'canceladoEm', p.cancelado_em,
        'itens', coalesce((select json_agg(json_build_object(
                        'animalId', i.animal_id,
                        'nome', i.nome_animal,
                        'raca', (select r.nome from animal a join raca r on r.id=a.raca_id where a.id=i.animal_id),
                        'porte', coalesce((select c.porte from cachorro c where c.id=i.animal_id),(select g.porte from gato g where g.id=i.animal_id)),
                        'precoUnitario', i.preco_unitario,
                        'imagemUrl', (select im.imagem_url from imagem_animal im where im.animal_id = i.animal_id
                                       order by im.principal desc, im.ordem, im.imagem_url limit 1)) order by i.nome_animal)
                     from item_pedido i where i.pedido_id = p.id), '[]'::json))
    from pedido p
    where p.id = p_pedido_id;
$$;

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
            insert into cachorro (id, porte, altura, peso) values (v_id, fn_texto(p_dados, 'porte'), (p_dados->>'altura')::numeric, (p_dados->>'peso')::numeric);
        when 'GATO' then
            insert into gato (id, porte, pelagem, altura, peso) values (v_id, fn_texto(p_dados, 'porte'), fn_texto(p_dados, 'pelagem'), (p_dados->>'altura')::numeric, (p_dados->>'peso')::numeric);
        when 'PASSARO' then
            insert into passaro (id, plumagem) values (v_id, fn_texto(p_dados, 'plumagem'));
        when 'PEIXE' then
            insert into peixe (id, tipo_de_agua, estirpe, ph, expectativa_de_vida)
            values (v_id, fn_texto(p_dados, 'tipoDeAgua'), fn_texto(p_dados, 'estirpe'), (p_dados ->> 'ph')::double precision, fn_texto(p_dados, 'expectativaDeVida'));
        when 'REPTIL' then
            insert into reptil (id, grupo, mutacao, altura, peso) values (v_id, fn_texto(p_dados, 'grupo'), fn_texto(p_dados, 'mutacao'), (p_dados->>'altura')::numeric, (p_dados->>'peso')::numeric);
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

    -- Um Animal reservado por um Pedido em andamento não pode voltar a ficar
    -- disponível pela edição (permitiria vendê-lo duas vezes).
    if coalesce((p_dados ->> 'disponivel')::boolean, false) and not v_animal.disponivel
       and exists (select 1 from item_pedido i join pedido p on p.id = i.pedido_id
                    where i.animal_id = p_animal_id and p.status <> 'CANCELADO') then
        raise exception using errcode = 'JP409', message = 'ANIMAL_RESERVADO',
            detail = 'O animal pertence a um pedido em andamento; cancele o pedido para liberá-lo.';
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
            update cachorro c set porte = case when p_dados ? 'porte' then fn_texto(p_dados, 'porte') else c.porte end,
             altura = case when p_dados ? 'altura' then (p_dados->>'altura')::numeric else c.altura end,
             peso = case when p_dados ? 'peso' then (p_dados->>'peso')::numeric else c.peso end
             where c.id = p_animal_id;
        when 'GATO' then
            update gato g set porte   = case when p_dados ? 'porte' then fn_texto(p_dados, 'porte') else g.porte end,
                              pelagem = case when p_dados ? 'pelagem' then fn_texto(p_dados, 'pelagem') else g.pelagem end,
             altura = case when p_dados ? 'altura' then (p_dados->>'altura')::numeric else g.altura end,
             peso = case when p_dados ? 'peso' then (p_dados->>'peso')::numeric else g.peso end
             where g.id = p_animal_id;
        when 'PASSARO' then
            update passaro pa set plumagem = case when p_dados ? 'plumagem' then fn_texto(p_dados, 'plumagem') else pa.plumagem end
             where pa.id = p_animal_id;
        when 'PEIXE' then
            update peixe pe set expectativa_de_vida = case when p_dados ? 'expectativaDeVida' then fn_texto(p_dados,'expectativaDeVida') else pe.expectativa_de_vida end, tipo_de_agua = case when p_dados ? 'tipoDeAgua' then fn_texto(p_dados, 'tipoDeAgua') else pe.tipo_de_agua end,
                                estirpe      = case when p_dados ? 'estirpe' then fn_texto(p_dados, 'estirpe') else pe.estirpe end,
                                ph           = case when p_dados ? 'ph' then (p_dados ->> 'ph')::double precision else pe.ph end
             where pe.id = p_animal_id;
        when 'REPTIL' then
            update reptil re set grupo   = case when p_dados ? 'grupo' then fn_texto(p_dados, 'grupo') else re.grupo end,
                                 mutacao = case when p_dados ? 'mutacao' then fn_texto(p_dados, 'mutacao') else re.mutacao end,
             altura = case when p_dados ? 'altura' then (p_dados->>'altura')::numeric else re.altura end,
             peso = case when p_dados ? 'peso' then (p_dados->>'peso')::numeric else re.peso end
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

-- Mantém a mesma política de execução das migrations originais.
revoke all on all functions in schema jpetstore from public;
