package br.com.jpetstore.backend;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.MountableFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

/**
 * Postgres temporário em Docker para os testes de integração. Aplica exatamente
 * as mesmas migrations do Supabase (na ordem do nome do arquivo), então o
 * banco da equipe na nuvem nunca é tocado pelos testes.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    static final Path MIGRATIONS = Path.of("..", "database", "supabase", "migrations");

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgres() {
        PostgreSQLContainer container = new PostgreSQLContainer("postgres:17-alpine");
        try (Stream<Path> arquivos = Files.list(MIGRATIONS)) {
            arquivos.filter(p -> p.toString().endsWith(".sql"))
                    .sorted()
                    .forEach(p -> container.withCopyFileToContainer(
                            MountableFile.forHostPath(p), "/docker-entrypoint-initdb.d/" + p.getFileName()));
        } catch (IOException e) {
            throw new UncheckedIOException("Migrations não encontradas em " + MIGRATIONS.toAbsolutePath(), e);
        }
        return container;
    }
}
