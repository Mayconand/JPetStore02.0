package br.com.jpetstore.backend.comum;

import lombok.extern.slf4j.Slf4j;
import org.postgresql.util.PSQLException;
import org.postgresql.util.ServerErrorMessage;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class TratadorDeErros {

    /** Mensagens para os códigos que as funções do banco levantam sem explicação. */
    private static final Map<String, String> MENSAGENS = Map.of(
            "CUPOM_INVALIDO", "Cupom inexistente ou vencido.",
            "RACA_JA_CADASTRADA", "Já existe uma raça com esse nome nesta espécie.",
            "RACA_INVALIDA", "A raça precisa existir e pertencer à mesma espécie do animal.",
            "ANIMAL_NAO_ENCONTRADO", "Animal não encontrado.",
            "ENDERECO_NAO_ENCONTRADO", "Endereço não encontrado.");

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErroResposta> api(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(new ErroResposta(e.getCodigo(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException e) {
        Map<String, String> campos = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(new ErroResposta("DADOS_INVALIDOS", "Verifique os campos informados.", campos));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErroResposta> formatoNaoSuportado(HttpMediaTypeNotSupportedException e) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(new ErroResposta("FORMATO_NAO_SUPORTADO",
                "Formato não suportado. Esperado: " + MediaType.toString(e.getSupportedMediaTypes()) + "."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErroResposta> envioMuitoGrande(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(new ErroResposta("ARQUIVO_MUITO_GRANDE", "O envio passa do tamanho máximo permitido."));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestPartException.class, MultipartException.class})
    public ResponseEntity<ErroResposta> requisicaoInvalida(Exception e) {
        return ResponseEntity.badRequest().body(new ErroResposta("REQUISICAO_INVALIDA", "Requisição mal formada."));
    }

    /**
     * Converte os erros levantados pelas funções de banco (SQLSTATE "JPnnn") em HTTP nnn.
     * Qualquer outro erro de banco vira 500 sem expor detalhes internos.
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErroResposta> banco(DataAccessException e) {
        for (Throwable causa = e; causa != null; causa = causa.getCause()) {
            if (causa instanceof PSQLException psql && psql.getSQLState() != null && psql.getSQLState().startsWith("JP")) {
                HttpStatus status = HttpStatus.resolve(Integer.parseInt(psql.getSQLState().substring(2)));
                ServerErrorMessage servidor = psql.getServerErrorMessage();
                String codigo = servidor != null ? servidor.getMessage() : "ERRO_DE_NEGOCIO";
                String mensagem = servidor != null && servidor.getDetail() != null
                        ? servidor.getDetail() : MENSAGENS.getOrDefault(codigo, codigo);
                return ResponseEntity.status(status != null ? status : HttpStatus.UNPROCESSABLE_CONTENT)
                        .body(new ErroResposta(codigo, mensagem));
            }
        }
        log.error("Erro inesperado de banco", e);
        return ResponseEntity.internalServerError().body(new ErroResposta("ERRO_INTERNO", "Erro inesperado."));
    }
}
