# Política de segurança

## ⚠️ Este repositório é intencionalmente vulnerável

**Não publique esta aplicação na internet. Não utilize nenhuma parte deste código em produção.**

Este projeto recupera uma versão do JPetStore baseada em **Apache Struts 1.2.9,
Spring 3.1 e iBATIS 2**, mantida deliberadamente sobre componentes que já
chegaram ao fim de sua vida útil. As vulnerabilidades são **inerentes ao código
original e à sua pilha tecnológica; nenhuma delas foi introduzida
artificialmente**.

O código-fonte da aplicação não foi alterado, exceto pelo necessário para que
voltasse a compilar — atualização das coordenadas das dependências — e por uma
mudança deliberada de configuração. O exemplo inclui uma camada Spring MVC e
outra baseada em Struts 1.2. A camada Struts incluída no projeto foi ativada em
`web.xml` utilizando o próprio mecanismo de alternância do exemplo.

O repositório existe como o estado **“antes”** de um processo de modernização de
legado assistido por IA — descoberta → especificação → reconstrução →
verificação. Dessa forma, é possível demonstrar que a versão **“depois”**
eliminou essas falhas.

## Comunicação de vulnerabilidades

**Não aceitamos relatórios de vulnerabilidades para este repositório.**

Qualquer vulnerabilidade encontrada aqui é esperada: ela constitui o objeto de
estudo, e não um defeito inesperado. As descobertas conhecidas estão catalogadas
em [`THREAT_MODEL.md`](./THREAT_MODEL.md).

A única situação que deve ser comunicada é algo **fora desse escopo
intencional**, como uma credencial exposta ou dados pessoais enviados por
engano ao repositório. Nesse caso, entre em contato com o proprietário por meio
do perfil do GitHub, em vez de publicar a informação em uma issue ou discussão.

## Uso seguro

Execute a aplicação somente em um ambiente descartável e isolado da rede. O
procedimento recomendado utiliza a configuração Docker incluída no projeto —
HSQLDB e Tomcat 9 — vinculada ao `localhost`. Consulte
[`run/README.md`](./run/README.md).

## Versão modernizada

A versão reconstruída, segura por padrão, está dividida em repositórios
separados: `jpetstore-backend`, `jpetstore-frontend` e
`jpetstore-database`.
