package br.com.jpetstore.backend.comum;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/** Corpo padrão das respostas de erro da API. "campos" só aparece em erros de validação. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResposta(String codigo, String mensagem, Map<String, String> campos) {

    public ErroResposta(String codigo, String mensagem) {
        this(codigo, mensagem, null);
    }
}
