# Modelo de ameaças — legacy-jpetstore

> Documento de referência que o responsável por segurança deve ler no início
> das etapas de descoberta e verificação. Define limites de confiança, entradas
> consideradas confiáveis e itens fora de escopo, evitando relatórios
> exagerados.

## O que é esta aplicação

O **JPetStore** é uma loja virtual de animais construída com **Apache Struts
1.2.9, Spring 3.1, iBATIS 2, HSQLDB e JSP**, executada por Docker.

Trata-se de um alvo de pesquisa **intencionalmente vulnerável**, usado como o
estado “antes” de um processo de localização e correção de falhas por IA e de
modernização de sistemas legados. **Não deve ser utilizado em produção nem
publicado na internet.**

Principais funcionalidades — 20 Actions do Struts e 13 tabelas no banco:
consulta ao catálogo, incluindo categorias, produtos e itens de estoque;
pesquisa; carrinho; checkout; pedidos e histórico de pedidos; cadastro de
conta; login; e edição de perfil.

## Camada web ativa — importante, atualizado em 03/08/2026

O JPetStore inclui tanto uma camada Spring MVC quanto uma camada Struts 1.2. A
camada utilizada pode ser alternada pelo mapeamento `*.do` em `web.xml`.

- Na configuração original do exemplo, o Spring MVC é usado por meio do
  `DispatcherServlet` chamado `petstore`. O mapeamento do `ActionServlet` do
  Struts fica comentado e, portanto, o código Struts não pode ser alcançado.
- Neste repositório, a camada Struts foi ativada em 03/08/2026. O mapeamento de
  servlet em `web.xml` foi alterado de `petstore` para `action`, utilizando o
  mecanismo oficial do próprio exemplo. Consequentemente, a camada web ativa é
  o **Struts 1.2.9**.
- Os caminhos `/remoting/*`, usados por Hessian, Burlap e HttpInvoker, e
  `/axis/*` permanecem ativos nas duas configurações, independentemente da
  camada escolhida para `*.do`.

Impactos que devem ser reavaliados ao gerar uma nova linha de base:

- A CVE-2014-0114 do Struts 1, relacionada à manipulação de ClassLoader e
  BeanUtils, passa a ser alcançável após a ativação do Struts. Na linha de base
  Spring MVC — execução `20260803_01` — ela havia sido refutada porque o
  `ActionServlet` não possuía mapeamento.
- Os problemas de atribuição em massa causados pelo data binding irrestrito do
  Spring — R3 e R4 da linha de base anterior — mudam de natureza, pois o Struts
  utiliza `ActionForm` com campos previamente definidos.
- Os mecanismos de sessão e validação também passam a utilizar a implementação
  do Struts. Caminhos que antes estavam apenas em código Struts inacessível
  agora fazem parte da aplicação ativa.

## Limites de confiança

| Limite | Ator | Capacidades |
|---|---|---|
| Não autenticado | Usuário anônimo | Consultar o catálogo, pesquisar e manipular o carrinho — acesso público esperado |
| Autenticado | Usuário conectado | Editar a própria conta e o próprio perfil, realizar pedidos e consultar o próprio histórico |
| Administração | — | Não existe interface nem funcionalidade administrativa no JPetStore |
| Camada de dados | — | O HSQLDB fica dentro do contêiner e deve ser acessado pela aplicação; a porta 9002 é exposta temporariamente apenas para testes locais |

## Ativos protegidos

- Credenciais dos usuários: `signon.username`, `signon.password` e dados de
  `account`.
- Dados de pedidos: `orders` e `lineitem`. Cada usuário deve conseguir consultar
  apenas os próprios pedidos.
- Sessões identificadas por `JSESSIONID`.

## Postura de segurança esperada

Qualquer desvio dos itens abaixo deve ser tratado como uma descoberta de
segurança:

- Consultas SQL parametrizadas, sem injeção de SQL.
- Saídas escapadas de acordo com o contexto, sem XSS.
- Proteção contra CSRF em ações que alteram estado.
- Senhas armazenadas como hash, nunca em texto simples.
- Verificação de autorização no acesso a contas e pedidos, sem IDOR.
- Nenhum segredo no código-fonte.
- Uso de dependências mantidas. Como o sistema é legado, vários componentes
  estão fora de suporte e devem ser registrados separadamente.

## Superfícies de ataque que devem ser analisadas

- **Entrada e injeção:** SQL injection causada por concatenação `$…$` nos
  SqlMaps do iBATIS, XSS por saída JSP sem escape e manipulação de parâmetros.
- **Autenticação e sessão:** armazenamento de senhas, processo de login e
  fixação de sessão.
- **Autorização e IDOR:** acesso a pedidos ou contas de outros usuários,
  especialmente em `viewOrder`.
- **CSRF:** Actions do Struts que alteram estado, como `addItemToCart`,
  `newOrder`, `editAccount` e `newAccount`.
- **Desserialização e ClassLoader:** CVE-2014-0114 do Struts 1, manipulação por
  BeanUtils/ClassLoader e bibliotecas Commons relacionadas.
- **Dependências vulneráveis:** Struts 1.2.9 fora de suporte, Spring 3.1,
  iBATIS, Axis, Hessian e outras dependências com vulnerabilidades conhecidas.
- **Remoting e web services:** servlet Axis em `/axis/*` e exportadores Hessian,
  Burlap e HttpInvoker em `/remoting/*`, incluindo riscos de desserialização e
  exposição do `OrderService`.

## Fora de escopo e observações de calibração

- O acesso anônimo ao catálogo é intencional e não deve ser relatado como
  vulnerabilidade.
- A exposição da porta 9002 do HSQLDB é uma medida temporária para testes. Ela
  não representa a arquitetura esperada para produção e não deve ser tratada
  como exposição de rede em produção.
- A camada de remoting e web services é uma funcionalidade de demonstração. A
  reconstrução deve removê-la ou substituí-la por REST, mas ela deve ser
  registrada como superfície de ataque enquanto permanecer ativa no legado.
  A decisão definitiva sobre sua remoção exige confirmação do responsável pelo
  projeto.
- Esta aplicação é um alvo intencionalmente vulnerável. O resultado da análise
  deve identificar **onde está a falha, como ela funciona, sua localização em
  arquivo e linha e se pode ser explorada**, em vez de apresentar apenas uma
  explicação genérica.

## Observações finais

- O Struts 1 chegou ao fim do suporte em 2013. É esperado encontrar diversas
  vulnerabilidades; esse é justamente o valor do estado “antes”.
- A fase 1 consiste em catalogar a linha de base sem alterações. Depois disso,
  o plano original prevê introduzir vulnerabilidades conhecidas de forma
  deliberada — CVE-2014-0114, SQL injection, XSS, ausência de CSRF e senhas em
  texto simples — para produzir uma diferença demonstrável. Qualquer execução
  dessa etapa deve ser explicitamente autorizada e permanecer isolada.
