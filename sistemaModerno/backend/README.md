# Backend

API do JPetStore moderno em **Java 21 + Spring Boot 4**, com banco no
**Supabase** (PostgreSQL). O schema e as funções de banco ficam em
`../database/supabase/migrations` (ver `../database/README.md`).

## Como rodar

1. Copie `.env.example` para `.env` e preencha (conexão do Session Pooler do
   Supabase e um `JWT_SECRET` aleatório com 32+ caracteres). O `.env` não é
   versionado.
2. `./mvnw spring-boot:run` (porta 8080).
3. No frontend, `npm run dev`: o Vite encaminha `/api` para `localhost:8080`.

## Testes

```bash
./mvnw test
```

Os testes de integração usam um **PostgreSQL local** (sem Docker), configurado
por `TEST_DB_URL`, `TEST_DB_USER` e `TEST_DB_PASSWORD` no `backend/.env` (ver
`.env.example`). O padrão é `jdbc:postgresql://localhost:5432/jpetstore_test`.

- O banco é criado automaticamente se não existir.
- A cada execução, o schema `jpetstore` é apagado e recriado com as mesmas
  migrations do Supabase; por isso o nome do banco **precisa terminar em
  `_test`** (os testes se recusam a rodar em outro banco ou no Supabase).
- Requisito: PostgreSQL 17 instalado (mesma versão principal do Supabase).

## Organização (por módulo)

```
br.com.jpetstore.backend
├── auth/       login, logout, emissão e revogação de JWT
├── usuario/    cadastro, perfil, senha, idioma, cartão e endereço
├── animal/     busca, detalhes de animais e tags
├── carrinho/   visualizar e atualizar carrinho
├── pedido/     listar, detalhar, criar, pagar e cancelar pedidos
├── rodape/     consultar, habilitar, desabilitar e personalizar rodapé
├── admin/      área administrativa (/api/admin/**, só ADMIN)
├── comum/      chamada às funções de banco e tratamento de erros
├── config/     segurança, JWT e CORS
├── entity/     entidades JPA
└── enums/
```

Cada módulo tem `Controller` → `Service` → `Repository`. Os repositories chamam
as funções de banco (`FuncoesBanco`), inclusive para login e troca de senha; as
entidades JPA existem para documentar o modelo e o Hibernate só **valida** o
schema (`ddl-auto=validate`), nunca o altera.

## Autenticação

- `POST /api/auth/login` devolve um JWT (HS256, 8 h). Envie-o em
  `Authorization: Bearer <token>`.
- `POST /api/auth/logout` revoga o token atual (ele deixa de ser aceito na hora).
- O token traz `sub` (id do usuário), `nome` e `papel` (`CLIENTE`/`ADMIN`).
- **RNF05:** tudo em `/api/admin/**` exige `ADMIN` (401 sem login, 403 para
  cliente). Além do token, o Papel é conferido no banco: quem perdeu o Papel
  ADMIN perde o acesso na hora. Novas rotas administrativas devem usar esse
  prefixo.

## Endpoints

| Método | Rota | Requisito | Acesso |
|---|---|---|---|
| POST | `/api/auth/login` | RF02 Realizar Login | público |
| POST | `/api/auth/logout` | RF10 Realizar Logout | logado |
| POST | `/api/usuarios` | RF03 Realizar Cadastro | público |
| GET | `/api/usuarios/me` | RF04 Visualizar Perfil | logado |
| PUT | `/api/usuarios/me` | RF05 Alterar Perfil | logado |
| PUT | `/api/usuarios/me/senha` | RF05 Alterar senha | logado |
| PUT | `/api/usuarios/me/idioma` `{idiomaPreferencial}` | RF11 Selecionar Idioma | logado |
| POST | `/api/usuarios/me/cartoes` `{numero, nomeTitular, dataValidade, bandeira}` | RF13 Cadastrar Cartão fictício | logado |
| GET | `/api/usuarios/me/enderecos` | Listar endereços próprios | logado |
| POST | `/api/usuarios/me/enderecos` | RF15 Cadastrar Endereço de Entrega | logado |
| GET | `/api/animais?termo=&especie=&racaId=&raca=&precoMin=&precoMax=&page=&size=` | RF07 Buscar Animais | público |
| GET | `/api/animais/{id}` | RF16 Visualizar Animal | público |
| GET | `/api/animais/tags?termo=` | RF17 Buscar Tags | público |
| GET | `/api/carrinho` | RF08 Visualizar Carrinho | logado |
| POST | `/api/carrinho/itens` `{animalId}` | RF09 Atualizar Carrinho | logado |
| DELETE | `/api/carrinho/itens/{animalId}` | RF09 Atualizar Carrinho | logado |
| DELETE | `/api/carrinho` | RF09 Atualizar Carrinho | logado |
| GET | `/api/pedidos` | RF06 Visualizar Pedidos | logado |
| GET | `/api/pedidos/{id}` | RF06 Visualizar Pedidos | logado |
| POST | `/api/pedidos` `{modalidade: RETIRADA\|ENTREGA, enderecoId}` | RF12 Finalizar Compra | logado |
| POST | `/api/pedidos/{id}/pagamento` `{forma, cartaoId}` | RF14 Pagamento simulado | logado (dono) |
| POST | `/api/pedidos/{id}/cancelar` | Cancelar pedido | logado (dono) |
| GET | `/api/admin/acesso` | RNF05 Controle de Acesso | ADMIN |
| GET | `/api/rodape` | Consultar o próprio rodapé | logado |
| POST | `/api/rodape/desabilitar` | RF18 Desabilitar o próprio footer | logado |
| POST | `/api/rodape/habilitar` | RF19 Habilitar o próprio footer | logado |
| PUT | `/api/rodape` `{conteudoHtml}` | RF20 Personalizar o próprio footer | logado |

Erros seguem o formato `{ "codigo": "CARRINHO_VAZIO", "mensagem": "..." }`
(validação: 400 com `campos`). A segurança usa o mesmo formato:
`NAO_AUTENTICADO` (401) e `ACESSO_NEGADO` (403).

Idiomas aceitos: `pt-BR`, `en` e `es`. Senhas novas têm no mínimo 8 caracteres.

## Compra de demonstração (RF11–RF20)

Os fluxos de idioma e compra reutilizam as funções SQL existentes, sem novas
dependências. O rodapé individual exige a migration descrita ao final desta seção.

1. Selecione a preferência com `PUT /api/usuarios/me/idioma`, por exemplo
   `{"idiomaPreferencial":"en"}`. Isso salva a preferência; a tradução das telas
   é responsabilidade do frontend.
2. Para entrega, cadastre um endereço em `POST /api/usuarios/me/enderecos` com
   `rua`, `numero`, `complemento` (opcional), `bairro` (opcional), `cidade`,
   `estado`, `cep` e `pais` (opcional). A resposta contém o `id`. O primeiro
   endereço vira principal automaticamente.
3. Para simular cartão, use `POST /api/usuarios/me/cartoes` com dados fictícios,
   por exemplo `{"numero":"4111111111111111","nomeTitular":"Cliente Teste",
   "dataValidade":"12/30","bandeira":"VISA"}`. A resposta contém o `id` do
   cartão. Apenas os quatro últimos dígitos são guardados; CVV não é utilizado.
4. Com animais no carrinho, crie o pedido em `POST /api/pedidos`. Use
   `{"modalidade":"ENTREGA","enderecoId":"<id>"}` ou
   `{"modalidade":"RETIRADA"}`. O pedido começa como `AGUARDANDO_PAGAMENTO`.
5. Confirme em `POST /api/pedidos/{id}/pagamento` com
   `{"forma":"CARTAO_CREDITO","cartaoId":"<id>"}`. Também são aceitos
   `{"forma":"PIX"}` e `{"forma":"BOLETO"}`, sem cartão. A API retorna o pedido
   como `PAGO`, usando o total calculado pelo banco. **Tudo é simulado: não há
   cobrança, emissão de boleto ou integração com banco/gateway.**

Criar o pedido e pagar são etapas separadas: se a simulação for recusada por dados
inválidos, o pedido continua aguardando pagamento e pode ser pago novamente ou
cancelado. Pedidos já pagos não aceitam outro pagamento.

O detalhe do animal inclui raça, atributos da espécie, fotos, tags, laudos e
orientações de cuidados. A busca de tags aceita trechos do nome e ignora acentos.
O rodapé é uma configuração individual: cada usuário autenticado pode consultar,
ocultar, reexibir e personalizar somente o seu, sem alterar o rodapé de outras
contas. O usuário é identificado pelo JWT, sem receber um id no corpo ou na URL.
As rotas não exigem papel ADMIN. O conteúdo aceita até 20.000 caracteres; mudar
a visibilidade preserva o conteúdo, e personalizar preserva a visibilidade.

Aplique a migration `20261124000100_rodape_por_usuario.sql` após as anteriores.
Ela cria `config_rodape_usuario`; contas sem configuração usam o rodapé padrão
existente. As antigas rotas `/api/admin/rodape/**` foram substituídas pelas rotas
acima. O frontend precisa consumi-las para refletir as preferências na interface.
