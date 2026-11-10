# Banco de dados (Supabase / PostgreSQL)

O banco do sistema moderno fica no **Supabase**. Tudo é criado por migrations
versionadas em `supabase/migrations/`, aplicadas em ordem:

| Arquivo | Conteúdo |
|---|---|
| `20261110120000_schema.sql` | schema `jpetstore`, tipos (enums), tabelas, índices e RLS |
| `20261110120100_funcoes.sql` | funções de banco para todos os requisitos funcionais (RF01–RF30) |
| `20261110120200_seed.sql` | espécies, raças (inspiradas no legado), animais de exemplo, usuários de desenvolvimento, cupom, rodapé e ajuda |

Os dados e scripts originais do legado continuam em `sistemaLegado/db`.

## Decisões importantes

- **Schema `jpetstore`, fora da API REST do Supabase.** O PostgREST só expõe o
  schema `public`, e todas as tabelas têm RLS habilitado sem políticas. Só o
  backend Java (conectado como dono do schema) acessa os dados.
- **IDs são UUID** (`gen_random_uuid()`).
- **Cada Animal é um indivíduo único.** O carrinho não tem quantidade. Ao criar um
  pedido, o animal fica `disponivel = false` e sai de todos os carrinhos; se o
  pedido for cancelado, ele volta a ficar disponível.
- **Raça é tabela** (`raca`) ligada à espécie; uma FK composta garante que a raça
  do animal é da mesma espécie dele.
- **Endereço único** para entrega e cobrança. Cada usuário pode ter vários, com
  exatamente um principal. O pedido guarda uma **cópia** do endereço de entrega,
  então editar ou apagar um endereço não altera pedidos antigos.
- **Pedido não é editado, só cancelado** (pelo dono, enquanto
  `AGUARDANDO_PAGAMENTO` ou `PAGO`).
- **Cartão:** apenas os 4 últimos dígitos são armazenados.

## Convenção de erros das funções

As funções levantam exceções com `SQLSTATE` `JPnnn`, onde `nnn` é o status HTTP
equivalente, e a mensagem é um código estável:

| SQLSTATE | Significado | Exemplos |
|---|---|---|
| `JP404` | não encontrado | `ANIMAL_NAO_ENCONTRADO`, `PEDIDO_NAO_ENCONTRADO` |
| `JP409` | conflito | `EMAIL_JA_CADASTRADO`, `ANIMAL_INDISPONIVEL` |
| `JP422` | regra de negócio | `CARRINHO_VAZIO`, `ENDERECO_INCOMPLETO`, `PEDIDO_NAO_CANCELAVEL` |

O backend converte isso automaticamente na resposta HTTP
(`{ "codigo": "...", "mensagem": "..." }`).

## Funções por requisito

| RF | Função(ões) |
|---|---|
| RF01 Visualizar Espécies | `fn_listar_especies` |
| RF02 Login | `fn_buscar_usuario_login` (senha conferida no backend com BCrypt) |
| RF03 Cadastro | `fn_cadastrar_usuario` |
| RF04 / RF05 Perfil | `fn_obter_perfil`, `fn_alterar_perfil`, `fn_alterar_senha` |
| RF06 Pedidos | `fn_listar_pedidos_usuario`, `fn_obter_pedido` |
| RF07 Buscar Animais | `fn_buscar_animais` (sem diferenciar acentos, paginada) |
| RF08 / RF09 Carrinho | `fn_obter_carrinho`, `fn_adicionar_item_carrinho`, `fn_remover_item_carrinho`, `fn_limpar_carrinho` |
| RF10 Logout | `fn_revogar_token`, `fn_token_revogado`, `fn_limpar_tokens_expirados` |
| RF11 Idioma | `fn_selecionar_idioma` |
| RF12 Finalizar Compra | `fn_criar_pedido`, `fn_cancelar_pedido` |
| RF13 Cartão | `fn_cadastrar_cartao` |
| RF14 Pagamento | `fn_realizar_pagamento` (simulado, sempre aprovado) |
| RF15 / RF21 Endereços | `fn_cadastrar_endereco`, `fn_cadastrar_endereco_alternativo`, `fn_listar_enderecos`, `fn_editar_endereco`, `fn_remover_endereco`, `fn_definir_endereco_principal` |
| RF16 Visualizar Animal | `fn_obter_animal` |
| RF17 Tags | `fn_buscar_tags` |
| RF18 / RF19 / RF20 Rodapé | `fn_desabilitar_rodape`, `fn_habilitar_rodape`, `fn_personalizar_rodape`, `fn_obter_rodape` |
| RF22 Ajuda | `fn_listar_ajuda` |
| RF23 / RF27 / RF28 Animais (admin) | `fn_cadastrar_animal`, `fn_editar_animal`, `fn_excluir_animal` |
| RF24 Raça | `fn_cadastrar_raca` |
| RF25 Clientes | `fn_listar_clientes` |
| RF26 Laudos | `fn_listar_laudos`, `fn_cadastrar_laudo` |
| RF29 Cupom | `fn_inserir_cupom`, `fn_aplicar_cupom_carrinho`, `fn_remover_cupom_carrinho` |
| RF30 Filtrar pedidos | `fn_filtrar_pedidos` |

Autorização (cliente x administrador) é feita no backend: as funções recebem o
id do usuário já autenticado.

## Usuários de desenvolvimento (seed)

| Email | Senha | Papel |
|---|---|---|
| `admin@jpetstore.com` | `Admin@123` | ADMIN |
| `cliente@jpetstore.com` | `Cliente@123` | CLIENTE |

**Troque essas senhas** antes de usar o banco fora de desenvolvimento. Também há
o cupom `BEMVINDO10` (10%).

## Aplicando no Supabase

Com o [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
cd sistemaModerno/database
supabase link --project-ref <project-ref>   # pede a senha do banco
supabase db push                            # aplica as migrations pendentes
```

Novas mudanças devem ser **novas migrations** (`supabase migration new <nome>`);
nunca edite uma migration que já foi aplicada no banco compartilhado.

## Testando localmente

Os testes do backend sobem um Postgres temporário em Docker
(Testcontainers) e aplicam estas mesmas migrations; o banco da equipe na nuvem
não é tocado. Para inspecionar à mão:

```bash
docker run --rm -p 5433:5432 -e POSTGRES_PASSWORD=dev \
  -v "$PWD/supabase/migrations:/docker-entrypoint-initdb.d:ro" postgres:17-alpine
```
