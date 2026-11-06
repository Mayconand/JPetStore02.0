# Sistema moderno

Esta pasta contém a reconstrução moderna do JPetStore. A aplicação será criada
gradualmente, mantendo testes de comportamento contra o sistema legado.

## Estrutura planejada

```text
sistemaModerno/
├── backend/   # API e regras de negócio com Spring Boot
├── frontend/  # Interface baseada no novo Figma
├── database/  # PostgreSQL, migrations e dados iniciais
└── e2e/       # Testes ponta a ponta do legado e da aplicação nova
```

Cada área possui um README próprio. As decisões de versão, bibliotecas e
contratos serão registradas antes da implementação para que a equipe trabalhe
com a mesma referência.

## Estratégia de migração

1. Registrar o comportamento atual com testes.
2. Criar a infraestrutura do sistema moderno.
3. Migrar catálogo e pesquisa.
4. Migrar carrinho e checkout.
5. Migrar contas, autenticação e pedidos.
6. Implementar o módulo administrativo.
7. Desativar o legado somente após a validação dos fluxos migrados.
