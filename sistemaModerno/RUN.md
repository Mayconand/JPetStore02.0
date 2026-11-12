# Como rodar o sistema moderno

O sistema tem duas partes que rodam ao mesmo tempo, cada uma em um terminal:

| Parte | Tecnologia | Endereço |
|---|---|---|
| Backend (API) | Java 21 + Spring Boot | http://localhost:8080 |
| Frontend | React + Vite | http://localhost:5173 |

O banco de dados é o **Supabase** da equipe (na nuvem). Não é preciso subir banco
local para usar o sistema.

## 1. Pré-requisitos

- **Java 21** (`java -version`)
- **Node.js** (`node -v`)
- Para rodar os testes: **PostgreSQL 17** instalado localmente (veja a seção 5)

O Maven não precisa ser instalado: o projeto usa o `mvnw` (Maven Wrapper).

## 2. Configurar o backend (só na primeira vez)

1. Copie `backend/.env.example` para `backend/.env`.
2. Preencha:
   - `SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`: os dados de
     conexão em *Project Settings → Database* no painel do Supabase. Peça acesso
     a quem administra o projeto.
     - Use a conexão do **Session Pooler**
       (`jdbc:postgresql://aws-0-<regiao>.pooler.supabase.com:5432/postgres?sslmode=require`,
       usuário `postgres.<project-ref>`). A conexão direta (`db.<ref>.supabase.co`)
       só funciona em redes com IPv6.
   - `JWT_SECRET`: qualquer texto aleatório com **32 caracteres ou mais**.
   - `CORS_ORIGENS`: deixe `http://localhost:5173`.

O `.env` guarda senhas e **nunca deve ser commitado** (ele já está no `.gitignore`).

## 3. Iniciar

**Terminal 1: backend**

```bash
cd sistemaModerno/backend
./mvnw spring-boot:run
```

No PowerShell use `.\mvnw spring-boot:run`. Espere aparecer
`Started BackendApplication` no log.

**Terminal 2: frontend**

```bash
cd sistemaModerno/frontend
npm install        # só na primeira vez (ou quando o package.json mudar)
npm run dev
```

O Vite encaminha as chamadas `/api` para o backend em `localhost:8080`; não é
preciso configurar mais nada.

Para parar, use `Ctrl+C` nos dois terminais.

## 4. Usar

Abra **http://localhost:5173**.

| Página | O que dá para fazer |
|---|---|
| `/login` | Entrar na conta |
| `/CadastroUser` | Criar conta (o primeiro endereço vira o principal) |
| `/HomeClient` | Ver animais disponíveis, buscar pelo cabeçalho, sair |
| `/Products?tipo=Cachorro` | Lista por espécie (`Cachorro`, `Gato`, `Passaro`, `Peixe`, `Reptil`) com filtros, paginação e "Adicionar ao carrinho" |
| `/Cart` | Página do carrinho (ainda não integrada à API) |

**Usuários de desenvolvimento** (criados pelo seed do banco):

| Email | Senha | Papel |
|---|---|---|
| `cliente@jpetstore.com` | `Cliente@123` | Cliente |
| `admin@jpetstore.com` | `Admin@123` | Administrador |

> ⚠️ O backend usa o **banco compartilhado da equipe**. Tudo que for cadastrado,
> adicionado ao carrinho ou comprado fica visível para todos. Comprar um animal o
> deixa indisponível até o pedido ser cancelado.

A API também pode ser testada direto no navegador nas rotas públicas, por
exemplo http://localhost:8080/api/animais?termo=gato. A lista completa de
endpoints está em `backend/README.md`.

## 5. Rodar os testes

Os testes usam um **PostgreSQL 17 local** (sem Docker), nunca o Supabase.

1. No `backend/.env`, preencha (modelo no `.env.example`):

   ```
   TEST_DB_URL=jdbc:postgresql://localhost:5432/jpetstore_test
   TEST_DB_USER=postgres
   TEST_DB_PASSWORD=<senha do postgres local>
   ```

2. Rode:

   ```bash
   cd sistemaModerno/backend
   ./mvnw test
   ```

O banco `jpetstore_test` é criado automaticamente e o schema é recriado a cada
execução, a partir das migrations do Supabase. Por segurança, o nome do banco
precisa terminar em `_test`.

## 6. Problemas comuns

| Sintoma | Causa provável e solução |
|---|---|
| Backend não sobe: `Connection refused`, `Network unreachable` ou timeout ao conectar | A conexão direta do Supabase exige IPv6. Use a URL do **Session Pooler** no `SUPABASE_DB_URL`. |
| Backend não sobe: `password authentication failed` | Usuário ou senha do Supabase errados no `.env`. No pooler, o usuário é `postgres.<project-ref>`. |
| Backend não sobe: `app.jwt.secret (JWT_SECRET) precisa ter pelo menos 32 caracteres` | Preencha o `JWT_SECRET` no `.env`. |
| `Port 8080 was already in use` / `Port 5173 is in use` | Outra instância já está rodando. Feche-a (ou o terminal antigo) e tente de novo. |
| Telas abrem, mas buscas e login falham com "Não foi possível conectar ao servidor" | O backend não está rodando (terminal 1). |
| Erro `Invalid method Code length 0` ou `ClassFormatError` | O VS Code e o Maven compilaram ao mesmo tempo na pasta `target/`. Apague `backend/target/classes` e `backend/target/test-classes` e rode de novo. |
| Testes falham com `Não foi possível preparar o banco de testes` | Confira se o PostgreSQL local está ligado e se `TEST_DB_*` no `backend/.env` estão corretos (porta, usuário e senha). |

## Mais detalhes

- `backend/README.md`: organização do código, autenticação e endpoints
- `database/README.md`: schema, funções de banco por requisito e como aplicar migrations no Supabase
