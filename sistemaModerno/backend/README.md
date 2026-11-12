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
├── usuario/    cadastro, perfil, senha
├── animal/     busca de animais
├── carrinho/   visualizar e atualizar carrinho
├── pedido/     listar, detalhar, criar e cancelar pedidos
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
| GET | `/api/animais?termo=&especie=&racaId=&raca=&precoMin=&precoMax=&page=&size=` | RF07 Buscar Animais | público |
| GET | `/api/carrinho` | RF08 Visualizar Carrinho | logado |
| POST | `/api/carrinho/itens` `{animalId}` | RF09 Atualizar Carrinho | logado |
| DELETE | `/api/carrinho/itens/{animalId}` | RF09 Atualizar Carrinho | logado |
| DELETE | `/api/carrinho` | RF09 Atualizar Carrinho | logado |
| GET | `/api/pedidos` | RF06 Visualizar Pedidos | logado |
| GET | `/api/pedidos/{id}` | RF06 Visualizar Pedidos | logado |
| POST | `/api/pedidos` `{modalidade: RETIRADA\|ENTREGA, enderecoId}` | Criar pedido (base do RF12) | logado |
| POST | `/api/pedidos/{id}/cancelar` | Cancelar pedido | logado (dono) |
| GET | `/api/admin/acesso` | RNF05 Controle de Acesso | ADMIN |

Erros seguem o formato `{ "codigo": "CARRINHO_VAZIO", "mensagem": "..." }`
(validação: 400 com `campos`). A segurança usa o mesmo formato:
`NAO_AUTENTICADO` (401) e `ACESSO_NEGADO` (403).

Idiomas aceitos: `pt-BR`, `en` e `es`. Senhas novas têm no mínimo 8 caracteres.
