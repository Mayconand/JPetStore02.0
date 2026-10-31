# Build the legacy application with the Java version it expects. This keeps the
# host machine independent from Java and Maven versions installed locally.
FROM maven:3.9-eclipse-temurin-8 AS build

WORKDIR /app
COPY pom.xml ./
COPY src/ ./src/
RUN mvn -B package -DskipTests

# Runtime image: WAR + HSQLDB 1.8 server + Tomcat 9 in one container.
FROM tomcat:9-jre8

# 既定の Tomcat サンプルアプリは不要
RUN rm -rf /usr/local/tomcat/webapps/*

# Deploy the WAR generated in the build stage.
COPY --from=build /app/target/org.springframework.samples.jpetstore-1.0.0-SNAPSHOT.war /usr/local/tomcat/webapps/jpetstore.war

# HSQLDB のプリロード済みデータベース一式（jpetstore.script 等）
COPY db/hsqldb/ /hsqldb-db/

# HSQLDB 1.8 サーバ用 jar と起動スクリプト
COPY run/hsqldb-1.8.0.7.jar /opt/hsqldb.jar
COPY run/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 8080 9002
ENTRYPOINT ["/entrypoint.sh"]
