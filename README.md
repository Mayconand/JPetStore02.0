# JPetStore 2.0

Este repositório reúne a aplicação legada e sua modernização no mesmo histórico
Git. A separação permite comparar comportamentos, migrar funcionalidades aos
poucos e manter o sistema original disponível durante o desenvolvimento.

## Estrutura

```text
JpetStore/
├── sistemaLegado/   # Aplicação original: Struts 1.2, Spring 3.1 e iBATIS 2
└── sistemaModerno/  # Nova implementação e testes da migração
```

## Executar o sistema legado

O ambiente legado utiliza Java 8, Tomcat 9 e HSQLDB dentro do Docker.

```powershell
cd sistemaLegado
docker compose up --build -d
```

Após a inicialização, acesse:

- Aplicação: <http://localhost:8080/jpetstore/>
- Teste do catálogo: <http://localhost:8080/jpetstore/shop/viewCategory.do?categoryId=FISH>

Para encerrar:

```powershell
docker compose down
```

Consulte [`sistemaLegado/run/README.md`](./sistemaLegado/run/README.md) para o
guia completo.

> **Aviso:** o sistema legado contém componentes fora de suporte e
> vulnerabilidades conhecidas. Ele deve ser executado somente em ambiente local
> e isolado. Consulte
> [`sistemaLegado/SECURITY.md`](./sistemaLegado/SECURITY.md).

## Sistema moderno

A nova implementação será desenvolvida em
[`sistemaModerno`](./sistemaModerno/README.md), dividida em backend, frontend,
banco de dados e testes ponta a ponta.
