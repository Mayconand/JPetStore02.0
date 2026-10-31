# Como executar o Legacy JPetStore

Este projeto usa Struts 1.2, Spring 3.1, iBATIS 2, HSQLDB 1.8 e Tomcat 9.
O ambiente foi preparado para compilar e executar tudo em contêineres. Assim,
o computador precisa apenas do Docker Desktop; Java, Maven, Tomcat e o banco
ficam dentro da imagem.

## Pré-requisito no Windows

1. Instale o Docker Desktop: <https://www.docker.com/products/docker-desktop/>.
2. Durante a instalação, habilite o backend WSL 2 quando solicitado.
3. Reinicie o Windows caso o instalador solicite.
4. Abra o Docker Desktop e aguarde aparecer `Engine running`.
5. Em um PowerShell novo, confirme:

```powershell
docker --version
docker compose version
```

## Iniciar a aplicação

Abra o PowerShell na raiz do projeto e execute:

```powershell
docker compose up --build -d
```

Na primeira execução, o Docker baixa as imagens, compila o WAR com Java 8 e
monta a imagem de execução. Isso pode levar alguns minutos. Nas próximas vezes,
as camadas em cache tornam o processo mais rápido.

Se uma tentativa anterior tiver parado em `dependency:go-offline`, basta rodar
novamente o comando acima: o Dockerfile atual não usa mais essa etapa, pois ela
tentava baixar dependências opcionais antigas que não são necessárias ao WAR.

Acompanhe a inicialização:

```powershell
docker compose logs -f
```

Quando aparecer `Server startup`, abra:

- Aplicação: <http://localhost:8080/jpetstore/>
- Teste de acesso ao banco: <http://localhost:8080/jpetstore/shop/viewCategory.do?categoryId=FISH>

Use `Ctrl+C` somente para sair da visualização dos logs; o contêiner continua
executando em segundo plano.

## Parar e iniciar novamente

```powershell
# Para e remove o contêiner (a imagem compilada permanece em cache)
docker compose down

# Inicia novamente
docker compose up -d
```

Depois de alterar código-fonte, reconstrua a imagem:

```powershell
docker compose up --build -d
```

Para apagar também a imagem local gerada pelo projeto:

```powershell
docker compose down --rmi local
```

## Diagnóstico rápido

```powershell
docker compose ps
docker compose logs --tail 200
```

Se a porta 8080 ou 9002 já estiver em uso, descubra o processo no PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 8080,9002 -ErrorAction SilentlyContinue
```

As portas publicadas são:

| Porta | Serviço |
|---:|---|
| 8080 | Tomcat/JPetStore |
| 9002 | HSQLDB (acesso JDBC opcional) |

Para conectar um cliente JDBC ao banco, use o driver
`run/hsqldb-1.8.0.7.jar`, classe `org.hsqldb.jdbcDriver`, URL
`jdbc:hsqldb:hsql://localhost:9002`, usuário `sa` e senha vazia. O driver deve
ser da linha 1.8; drivers HSQLDB 2.x não são compatíveis com este servidor.

## Build local opcional

O fluxo recomendado é Docker. Se Java e Maven já estiverem configurados, o WAR
também pode ser gerado diretamente:

```powershell
mvn package -DskipTests
```

O artefato será criado em
`target/org.springframework.samples.jpetstore-1.0.0-SNAPSHOT.war`.
