package br.com.jpetstore.backend.comum;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Erro de negócio com status HTTP e código estável (ex.: CREDENCIAIS_INVALIDAS). */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String codigo;

    public ApiException(HttpStatus status, String codigo, String mensagem) {
        super(mensagem);
        this.status = status;
        this.codigo = codigo;
    }
}
