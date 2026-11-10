package br.com.jpetstore.backend;

import org.junit.jupiter.api.function.Executable;
import org.postgresql.util.PSQLException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Base dos testes que chamam diretamente as funções de banco (schema jpetstore)
 * para os RFs que ainda não têm endpoint. Usa o banco local de testes (BancoDeTesteConfig) com as
 * migrations do Supabase. Cada teste cria seus próprios dados.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(BancoDeTesteConfig.class)
abstract class FuncoesBancoTestBase {

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    JsonMapper json;

    /** {@code select <chamada>} devolvendo um valor simples. */
    <T> T valor(String chamada, Class<T> tipo, Object... args) {
        return jdbc.queryForObject("select " + chamada, tipo, args);
    }

    /** {@code select <chamada>} devolvendo JSON. */
    JsonNode jsonDe(String chamada, Object... args) {
        return json.readTree(jdbc.queryForObject("select " + chamada + "::text", String.class, args));
    }

    /** Executa uma função sem retorno relevante (ex.: void). */
    void executar(String chamada, Object... args) {
        jdbc.query("select " + chamada, rs -> { }, args);
    }

    /** Verifica que a chamada falha com o SQLSTATE e o código de erro esperados. */
    void deveFalhar(String sqlState, String codigo, Executable chamada) {
        DataAccessException erro = assertThrows(DataAccessException.class, chamada);
        PSQLException psql = (PSQLException) erro.getMostSpecificCause();
        assertThat(psql.getSQLState()).isEqualTo(sqlState);
        assertThat(psql.getServerErrorMessage().getMessage()).isEqualTo(codigo);
    }

    UUID novoUsuario() {
        return valor("jpetstore.fn_cadastrar_usuario(?, ?, ?, ?, ?)", UUID.class,
                "Teste", "Funcoes", "func-" + UUID.randomUUID() + "@exemplo.com", null, "$2a$10$hash-qualquer");
    }

    UUID novoAnimal(String preco) {
        return valor("""
                jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
                    'racaId', (select id from jpetstore.raca where nome = 'Bulldog'),
                    'nome', 'Animal ' || gen_random_uuid(), 'preco', ?::numeric))
                """, UUID.class, preco);
    }

    /** Usuário com um Animal no Carrinho e um Pedido (retirada) criado a partir dele. */
    UUID novoPedido(UUID usuario, String preco) {
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", usuario, novoAnimal(preco));
        return valor("jpetstore.fn_criar_pedido(?, 'RETIRADA')", UUID.class, usuario);
    }

    String codigoUnico(String prefixo) {
        return prefixo + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
