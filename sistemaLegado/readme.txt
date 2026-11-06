=========================================
== Aplicação de exemplo Spring JPetStore ==
=========================================

INÍCIO RÁPIDO (recomendado): o repositório inclui um ambiente Docker
reproduzível que compila com Java 8 e executa o Tomcat com o HSQLDB. Consulte
o guia passo a passo em português em run/README.md e, a partir deste diretório,
execute: docker compose up --build -d

@author Juergen Hoeller
Baseado no JPetStore de Clinton Begin (http://www.ibatis.com).


1. MOTIVAÇÃO

Apresenta uma camada intermediária gerenciada pelo Spring, utilizando a camada
de banco de dados do iBATIS como estratégia de acesso a dados, em conjunto com
as abstrações de transação e DAO do Spring.

Pode trabalhar com transações JDBC locais ou JTA. No segundo caso, utiliza dois
bancos de dados. Emprega o mesmo modelo de dados e o mesmo conteúdo de
demonstração do JPetStore original. Para obter detalhes, consulte as definições
de contexto "WEB-INF/dataAccessContext-local.xml" e
"WEB-INF/dataAccessContext-jta.xml", respectivamente.

Oferece duas implementações alternativas da camada web com a mesma interface:
uma baseada no Spring Web MVC e outra no Struts 1.2. A segunda é semelhante ao
JPetStore original, mas foi adaptada para JSTL, deixando as implementações JSP
mais fáceis de comparar. Para obter detalhes, consulte "WEB-INF/web.xml",
"WEB-INF/petstore-servlet.xml" e "WEB-INF/struts-config.xml".

Em comparação com o JPetStore original, esta implementação possui melhorias
significativas na estrutura interna e no baixo acoplamento. Ela utiliza o
conceito de contexto de aplicação do Spring, oferecendo um local central para
configurar os objetos da aplicação. A melhoria mais relevante está no antigo
PetStoreLogic, agora chamado PetStoreFacade: ele deixou de ser responsável por
detalhes de configuração, recursos ou transações.

Observe que a implementação web baseada no Spring foi deliberadamente mantida
parecida com a implementação Struts e não pretende oferecer melhorias como
mensagens de erro exibidas diretamente nos campos. A presença das duas opções
de camada web demonstra diferenças e semelhanças entre os respectivos modelos
de programação e também ilustra estilos distintos de configuração.


2. COMPILAÇÃO E IMPLANTAÇÃO

Este diretório contém o código-fonte da aplicação web. Para implantá-la, é
necessário gerar o pacote com o Apache Maven. Os únicos requisitos originais
são JDK >= 1.5 e Maven >= 2.0.8.

Execute "mvn package" neste diretório para gerar os arquivos WAR. O arquivo
"org.springframework.samples.jpetstore-1.0.0-SNAPSHOT.war" será criado no
diretório "target".

Para executar a aplicação web com as configurações padrão, inicie a instância
do HSQLDB no diretório "db/hsqldb", por exemplo, usando "server.bat". Para
outros bancos de dados, utilize os scripts de esquema e carga correspondentes
no subdiretório "db", assim como no JPetStore original. No modo local, as
configurações JDBC podem ser alteradas em "WEB-INF/jdbc.properties". Com JTA,
é necessário configurar os DataSources correspondentes no contêiner J2EE.

Os arquivos "WEB-INF/dataAccessContext-*.xml" podem precisar de ajustes para
determinados bancos, como MS SQL e Oracle, a fim de utilizar estratégias
apropriadas para gerar os identificadores dos pedidos. Consulte as definições
DAO comentadas nos arquivos XML de contexto.

Guia de implantação passo a passo, considerando JDK 1.5.x e Tomcat 6.x:

1. Execute "mvn package" para gerar o arquivo WAR.
2. Copie "target/org.springframework.samples.jpetstore-1.0.0-SNAPSHOT.war"
   para "<TOMCAT_HOME>/webapps/jpetstore.war".
3. Inicie o HSQLDB usando "db/hsqldb/server.bat" ou
   "db/hsqldb/server.sh".
4. Inicie o Tomcat, cuja porta padrão é 8080.
5. Abra "http://localhost:8080/jpetstore" em um navegador.
