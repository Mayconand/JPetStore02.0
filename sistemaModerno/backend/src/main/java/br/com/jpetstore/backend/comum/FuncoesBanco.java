package br.com.jpetstore.backend.comum;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

/**
 * Ponto único de chamada às funções do schema "jpetstore".
 * Funções que devolvem JSON são convertidas direto para records Java.
 * Erros levantados pelas funções (SQLSTATE JPnnn) são tratados em {@link TratadorDeErros}.
 */
@Component
public class FuncoesBanco {

    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public FuncoesBanco(JdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    /** Executa {@code select <sql>} cujo resultado é um único valor JSON e o converte para {@code tipo}. */
    public <T> T json(String sql, Class<T> tipo, Object... args) {
        String resultado = jdbc.queryForObject("select " + sql, String.class, args);
        return resultado == null ? null : json.readValue(resultado, tipo);
    }

    /** Executa {@code select <sql>} cujo resultado é um único valor simples. */
    public <T> T valor(String sql, Class<T> tipo, Object... args) {
        return jdbc.queryForObject("select " + sql, tipo, args);
    }

    /** Executa {@code select * from <sql>} e mapeia cada linha. */
    public <T> List<T> linhas(String sql, RowMapper<T> mapper, Object... args) {
        return jdbc.query("select * from " + sql, mapper, args);
    }

    /** Executa uma função sem retorno relevante. */
    public void executar(String sql, Object... args) {
        jdbc.query("select " + sql, rs -> { }, args);
    }

    /** Serializa um objeto Java para ser passado como parâmetro jsonb ({@code ?::jsonb}). */
    public String paraJson(Object valor) {
        return valor == null ? null : json.writeValueAsString(valor);
    }
}
