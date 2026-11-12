package br.com.jpetstore.backend.config;

import br.com.jpetstore.backend.comum.ErroResposta;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;

/**
 * Respostas 401/403 da camada de segurança no mesmo formato dos demais erros
 * da API ({codigo, mensagem}), mantendo o cabeçalho WWW-Authenticate padrão.
 */
@Component
public class RespostasDeSeguranca {

    private final JsonMapper json;
    private final BearerTokenAuthenticationEntryPoint bearerEntryPoint = new BearerTokenAuthenticationEntryPoint();
    private final BearerTokenAccessDeniedHandler bearerAccessDenied = new BearerTokenAccessDeniedHandler();

    public RespostasDeSeguranca(JsonMapper json) {
        this.json = json;
    }

    /** 401 — sem login, token inválido, expirado ou revogado. */
    public AuthenticationEntryPoint naoAutenticado() {
        return (request, response, excecao) -> {
            bearerEntryPoint.commence(request, response, excecao);
            escrever(response, HttpStatus.UNAUTHORIZED,
                    new ErroResposta("NAO_AUTENTICADO", "Faça login para continuar."));
        };
    }

    /** 403 — logado, mas sem o Papel exigido. */
    public AccessDeniedHandler acessoNegado() {
        return (request, response, excecao) -> {
            bearerAccessDenied.handle(request, response, excecao);
            escrever(response, HttpStatus.FORBIDDEN,
                    new ErroResposta("ACESSO_NEGADO", "Você não tem permissão para acessar este recurso."));
        };
    }

    private void escrever(HttpServletResponse response, HttpStatus status, ErroResposta erro) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        json.writeValue(response.getOutputStream(), erro);
    }
}
