-- =============================================================================
-- JPetStore — Dados iniciais para desenvolvimento
-- Raças inspiradas no catálogo do sistema legado (sistemaLegado/db) e nas
-- opções já exibidas pelo frontend.
--
-- Usuários de desenvolvimento (TROCAR A SENHA no primeiro uso em ambiente real):
--   admin@jpetstore.com   / Admin@123    (ADMIN)
--   cliente@jpetstore.com / Cliente@123  (CLIENTE)
-- =============================================================================

set search_path to jpetstore;

-- -----------------------------------------------------------------------------
-- Espécies (RF01 / RNF07)
-- -----------------------------------------------------------------------------
insert into jpetstore.especie (codigo, nome, descricao, cuidados) values
('CACHORRO', 'Cachorro', 'Companheiros leais para todas as famílias.',
 'Ração adequada ao porte e à idade, água fresca sempre disponível, passeios diários, vacinação (V8/V10 e antirrábica) e vermifugação em dia.'),
('GATO', 'Gato', 'Independentes, carinhosos e ótimos para apartamentos.',
 'Ração de qualidade, caixa de areia limpa, arranhadores, telas nas janelas, vacinação (V4/V5 e antirrábica) e vermifugação periódica.'),
('PASSARO', 'Pássaro', 'Aves alegres e cheias de personalidade.',
 'Gaiola ou viveiro espaçoso, alimentação com sementes, frutas e verduras, banho de sol diário e higienização frequente do ambiente.'),
('PEIXE', 'Peixe', 'Aquários que trazem tranquilidade para casa.',
 'Aquário ciclado, filtragem adequada, controle de temperatura e pH, trocas parciais de água e alimentação sem excessos.'),
('REPTIL', 'Réptil', 'Animais exóticos para quem busca algo diferente.',
 'Terrário com aquecimento e iluminação UVB, controle de umidade, dieta específica da espécie e acompanhamento com veterinário de exóticos.');

-- -----------------------------------------------------------------------------
-- Raças (RF24)
-- -----------------------------------------------------------------------------
select jpetstore.fn_cadastrar_raca(e, n, d) from (values
    ('CACHORRO', 'Bulldog', 'Cão amigável originário da Inglaterra.'),
    ('CACHORRO', 'Poodle', 'Cão adorável originário da França.'),
    ('CACHORRO', 'Dálmata', 'Ótimo cão para quartéis de bombeiros.'),
    ('CACHORRO', 'Golden Retriever', 'Excelente cão de família.'),
    ('CACHORRO', 'Labrador Retriever', 'Ótimo cão de caça e de companhia.'),
    ('CACHORRO', 'Chihuahua', 'Ótimo cão de companhia.'),
    ('CACHORRO', 'Pastor Alemão', 'Cão protetor e muito inteligente.'),
    ('CACHORRO', 'Shih Tzu', 'Cão dócil e companheiro.'),
    ('CACHORRO', 'Pinscher', 'Pequeno, ágil e corajoso.'),
    ('CACHORRO', 'Rottweiler', 'Cão forte e protetor.'),
    ('GATO', 'Manx', 'Ótimo para controlar a população de ratos.'),
    ('GATO', 'Persa', 'Gato doméstico amigável, uma verdadeira princesa.'),
    ('GATO', 'Siamês', 'Gato curioso e comunicativo.'),
    ('GATO', 'Maine Coon', 'Gato de grande porte e muito sociável.'),
    ('GATO', 'Angorá', 'Gato elegante de pelagem longa.'),
    ('GATO', 'Sphynx', 'Gato sem pelos e muito carinhoso.'),
    ('GATO', 'Bengal', 'Gato ativo com pelagem que lembra um leopardo.'),
    ('PASSARO', 'Papagaio', 'Ótimo companheiro por até 75 anos.'),
    ('PASSARO', 'Calopsita', 'Ave dócil e fácil de cuidar.'),
    ('PASSARO', 'Canário', 'Conhecido pelo seu canto.'),
    ('PASSARO', 'Periquito', 'Ave pequena e sociável.'),
    ('PASSARO', 'Arara', 'Ave grande e muito colorida.'),
    ('PASSARO', 'Mandarim', 'Ótimo para aliviar o estresse.'),
    ('PEIXE', 'Peixe-anjo', 'Peixe de água salgada da Austrália.'),
    ('PEIXE', 'Tubarão-tigre', 'Peixe de água salgada da Austrália.'),
    ('PEIXE', 'Carpa Koi', 'Peixe de água doce do Japão.'),
    ('PEIXE', 'Kinguio', 'Peixe de água doce da China.'),
    ('PEIXE', 'Betta', 'Peixe de água doce muito colorido.'),
    ('PEIXE', 'Peixe-palhaço', 'Peixe de água salgada que vive entre anêmonas.'),
    ('PEIXE', 'Guppy', 'Peixe pequeno e fácil de manter.'),
    ('PEIXE', 'Acará-disco', 'Peixe de água doce da Amazônia.'),
    ('REPTIL', 'Cascavel', 'Também serve como cão de guarda.'),
    ('REPTIL', 'Iguana', 'Amigo verde e simpático.'),
    ('REPTIL', 'Jabuti', 'Quelônio tranquilo e longevo.'),
    ('REPTIL', 'Gecko', 'Lagarto pequeno e fácil de manter.'),
    ('REPTIL', 'Camaleão', 'Mestre da camuflagem.'),
    ('REPTIL', 'Corn Snake', 'Serpente dócil e não venenosa.')
) as r(e, n, d);

-- -----------------------------------------------------------------------------
-- Animais (RF23), com imagens, tags e laudos
-- -----------------------------------------------------------------------------
do $$
begin
    -- Cachorros
    perform jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Labrador Retriever'),
        'nome', 'Snoopy', 'preco', 2500.00, 'dataNascimento', '2024-08-31', 'sexo', 'MACHO', 'castrado', false,
        'descricao', 'Labrador brincalhão e muito carinhoso.', 'porte', 'GRANDE',
        'imagens', jsonb_build_array('https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'),
        'tags', jsonb_build_array('Amigável', 'Brincalhão', 'Carinhoso'),
        'laudos', jsonb_build_array(jsonb_build_object('titulo', 'Carteira de vacinação', 'descricao', 'V10 e antirrábica em dia.', 'dataEmissao', '2026-09-01'))));

    perform jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Pastor Alemão'),
        'nome', 'Luke', 'preco', 3200.00, 'dataNascimento', '2024-08-31', 'sexo', 'MACHO', 'castrado', false,
        'descricao', 'Pastor alemão protetor e inteligente.', 'porte', 'GRANDE',
        'imagens', jsonb_build_array('https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400'),
        'tags', jsonb_build_array('Protetor', 'Ativo', 'Inteligente'),
        'laudos', jsonb_build_array(jsonb_build_object('titulo', 'Vermifugação', 'descricao', 'Vermifugado em 08/2026.', 'dataEmissao', '2026-08-15'))));

    perform jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Poodle'),
        'nome', 'Mel', 'preco', 1800.00, 'dataNascimento', '2025-03-10', 'sexo', 'FEMEA', 'castrado', true,
        'descricao', 'Poodle dócil, ótima para apartamentos.', 'porte', 'PEQUENO',
        'imagens', jsonb_build_array('https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?w=400'),
        'tags', jsonb_build_array('Dócil', 'Calmo')));

    -- Gatos
    perform jpetstore.fn_cadastrar_animal('GATO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Persa'),
        'nome', 'Vanda', 'preco', 1500.00, 'dataNascimento', '2025-08-20', 'sexo', 'FEMEA', 'castrado', false,
        'descricao', 'Persa tranquila e sociável.', 'porte', 'MEDIO', 'pelagem', 'Longa branca',
        'imagens', jsonb_build_array('https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400'),
        'tags', jsonb_build_array('Tranquila', 'Carinhosa', 'Sociável'),
        'laudos', jsonb_build_array(jsonb_build_object('titulo', 'Carteira de vacinação', 'descricao', 'V5 e antirrábica em dia.', 'dataEmissao', '2026-07-10'))));

    perform jpetstore.fn_cadastrar_animal('GATO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Siamês'),
        'nome', 'Tom', 'preco', 1200.00, 'dataNascimento', '2025-05-12', 'sexo', 'MACHO', 'castrado', true,
        'descricao', 'Siamês curioso e muito ativo.', 'porte', 'PEQUENO', 'pelagem', 'Curta',
        'imagens', jsonb_build_array('https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400'),
        'tags', jsonb_build_array('Curioso', 'Ativo', 'Dócil')));

    -- Pássaros
    perform jpetstore.fn_cadastrar_animal('PASSARO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Calopsita'),
        'nome', 'Kiwi', 'preco', 350.00, 'dataNascimento', '2026-01-05', 'sexo', 'MACHO',
        'descricao', 'Calopsita mansa, já acostumada com pessoas.', 'plumagem', 'Cinza com bochechas laranja',
        'tags', jsonb_build_array('Manso', 'Cantor')));

    perform jpetstore.fn_cadastrar_animal('PASSARO', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Papagaio'),
        'nome', 'Louro', 'preco', 4500.00, 'dataNascimento', '2023-11-20', 'sexo', 'MACHO',
        'descricao', 'Papagaio legalizado com anilha e nota fiscal.', 'plumagem', 'Verde',
        'tags', jsonb_build_array('Falante', 'Sociável'),
        'laudos', jsonb_build_array(jsonb_build_object('titulo', 'Certificado de origem', 'descricao', 'Criadouro autorizado pelo IBAMA.', 'dataEmissao', '2026-06-01'))));

    -- Peixes
    perform jpetstore.fn_cadastrar_animal('PEIXE', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Carpa Koi'),
        'nome', 'Sakura', 'preco', 280.00, 'dataNascimento', '2025-10-01',
        'descricao', 'Koi com manchas vermelhas.', 'tipoDeAgua', 'DOCE', 'estirpe', 'Kohaku', 'ph', 7.2,
        'tags', jsonb_build_array('Ornamental')));

    perform jpetstore.fn_cadastrar_animal('PEIXE', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Peixe-palhaço'),
        'nome', 'Nemo', 'preco', 120.00, 'dataNascimento', '2026-04-15',
        'descricao', 'Peixe-palhaço criado em cativeiro.', 'tipoDeAgua', 'SALGADA', 'estirpe', 'Ocellaris', 'ph', 8.2,
        'tags', jsonb_build_array('Ornamental', 'Colorido')));

    -- Répteis
    perform jpetstore.fn_cadastrar_animal('REPTIL', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Iguana'),
        'nome', 'Rex', 'preco', 900.00, 'dataNascimento', '2024-12-01', 'sexo', 'MACHO',
        'descricao', 'Iguana verde adulta e mansa.', 'grupo', 'LAGARTOS', 'mutacao', 'Normal',
        'tags', jsonb_build_array('Exótico', 'Calmo')));

    perform jpetstore.fn_cadastrar_animal('REPTIL', jsonb_build_object(
        'racaId', (select id from jpetstore.raca where nome = 'Jabuti'),
        'nome', 'Tartaruguinha', 'preco', 650.00, 'dataNascimento', '2025-02-14', 'sexo', 'FEMEA',
        'descricao', 'Jabuti-piranga com documentação.', 'grupo', 'QUELONIOS',
        'tags', jsonb_build_array('Exótico', 'Longevo')));
end
$$;

-- -----------------------------------------------------------------------------
-- Usuários de desenvolvimento (ids fixos para facilitar testes manuais)
-- -----------------------------------------------------------------------------
insert into jpetstore.usuario (id, nome, sobrenome, email, telefone, senha_hash, papel, idioma_preferencial) values
('00000000-0000-0000-0000-00000000a001', 'Admin', 'JPetStore', 'admin@jpetstore.com', '(11) 90000-0001',
 '$2a$10$j3t0.1hqWFgLuxZoMgU2UeF.MbHlrV3fcFmkrYuuUaRS3WrdvqdGK', 'ADMIN', 'pt-BR'),
('00000000-0000-0000-0000-00000000c001', 'Cliente', 'Exemplo', 'cliente@jpetstore.com', '(11) 90000-0002',
 '$2a$10$lgVDSMiDYPjP/19MVUvmCe7wpByKmqKuZ2f8XnPGlVidK4wvdo7N6', 'CLIENTE', 'pt-BR');

select jpetstore.fn_cadastrar_endereco('00000000-0000-0000-0000-00000000c001', jsonb_build_object(
    'rua', 'Avenida Paulista', 'numero', '1000', 'complemento', 'Apto 12', 'bairro', 'Bela Vista',
    'cidade', 'São Paulo', 'estado', 'SP', 'cep', '01310-100', 'pais', 'Brasil'));

select jpetstore.fn_cadastrar_endereco_alternativo('00000000-0000-0000-0000-00000000c001', jsonb_build_object(
    'rua', 'Rua das Flores', 'numero', '25', 'bairro', 'Centro',
    'cidade', 'Campinas', 'estado', 'SP', 'cep', '13010-000', 'pais', 'Brasil'));

-- -----------------------------------------------------------------------------
-- Cupom, rodapé e ajuda
-- -----------------------------------------------------------------------------
insert into jpetstore.cupom (codigo, percentual_desconto, data_validade)
values ('BEMVINDO10', 10, date '2027-12-31');

insert into jpetstore.config_rodape (id, visivel, conteudo_html)
values (1, true, '<p>JPetStore — contato@jpetstore.com</p>');

insert into jpetstore.topico_ajuda (titulo, conteudo, ordem) values
('Como comprar um animal?', 'Encontre o animal pela busca, adicione ao carrinho e finalize o pedido escolhendo retirada na loja ou entrega em um dos seus endereços.', 1),
('Posso cancelar meu pedido?', 'Sim. Pedidos aguardando pagamento ou já pagos podem ser cancelados pelo próprio cliente antes do envio.', 2),
('Como cadastrar outro endereço?', 'No seu perfil você pode cadastrar vários endereços e escolher qual usar na hora de finalizar a compra.', 3),
('Os animais são vacinados?', 'Cada animal possui laudos com informações de vacinação, vermifugação e condições sanitárias.', 4);
