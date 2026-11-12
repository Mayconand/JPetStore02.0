package br.com.jpetstore.backend;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Prepara o banco de testes no PostgreSQL local: cria o banco se não existir,
 * apaga o schema jpetstore e aplica as mesmas migrations do Supabase, em ordem.
 * Roda uma única vez por execução da suíte.
 *
 * Proteção: só aceita bancos cujo nome termina em "_test" e que não estejam no
 * Supabase, porque o schema é apagado a cada execução.
 */
final class MigracoesDeTeste {

    static final Path MIGRATIONS = Path.of("..", "database", "supabase", "migrations");

    private static final Pattern URL_POSTGRES = Pattern.compile("^(jdbc:postgresql://[^/]+/)([^?]+)(.*)$");

    private static boolean preparado;

    private MigracoesDeTeste() {
    }

    static synchronized void prepararUmaVez(String url, String usuario, String senha) {
        if (preparado) {
            return;
        }
        String banco = validarAlvo(url);
        try {
            criarBancoSeNaoExistir(url, banco, usuario, senha);
            try (Connection conexao = DriverManager.getConnection(url, usuario, senha);
                 Statement st = conexao.createStatement()) {
                st.execute("drop schema if exists jpetstore cascade");
                for (Path migration : migrations()) {
                    st.execute(Files.readString(migration, StandardCharsets.UTF_8));
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Não foi possível preparar o banco de testes em " + url
                    + ". Confira TEST_DB_URL, TEST_DB_USER e TEST_DB_PASSWORD no backend/.env.", e);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        preparado = true;
    }

    private static String validarAlvo(String url) {
        Matcher m = URL_POSTGRES.matcher(url == null ? "" : url);
        if (!m.matches()) {
            throw new IllegalStateException("TEST_DB_URL inválida: esperado jdbc:postgresql://host:porta/banco_test");
        }
        String banco = m.group(2);
        if (!banco.endsWith("_test") || url.contains("supabase")) {
            throw new IllegalStateException("Por segurança, os testes só rodam em um banco local cujo nome termina em "
                    + "\"_test\" (o schema jpetstore é apagado a cada execução). Recebido: " + banco);
        }
        return banco;
    }

    private static void criarBancoSeNaoExistir(String url, String banco, String usuario, String senha) throws SQLException {
        try (Connection ignorada = DriverManager.getConnection(url, usuario, senha)) {
            return;
        } catch (SQLException e) {
            if (!"3D000".equals(e.getSQLState())) { // 3D000 = banco não existe
                throw e;
            }
        }
        Matcher m = URL_POSTGRES.matcher(url);
        m.matches();
        String urlManutencao = m.group(1) + "postgres" + m.group(3);
        try (Connection conexao = DriverManager.getConnection(urlManutencao, usuario, senha);
             Statement st = conexao.createStatement()) {
            st.execute("create database \"" + banco + "\" with encoding 'UTF8' template template0");
        }
    }

    private static List<Path> migrations() throws IOException {
        try (Stream<Path> arquivos = Files.list(MIGRATIONS)) {
            return arquivos.filter(p -> p.toString().endsWith(".sql")).sorted().toList();
        }
    }
}
