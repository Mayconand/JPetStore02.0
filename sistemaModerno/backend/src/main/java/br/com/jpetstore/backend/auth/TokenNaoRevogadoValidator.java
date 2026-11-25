package br.com.jpetstore.backend.auth;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

/** Rejeita tokens que passaram pelo logout (RF10). */
@Component
public class TokenNaoRevogadoValidator implements OAuth2TokenValidator<Jwt> {

    private final TokenRepository tokens;

    public TokenNaoRevogadoValidator(TokenRepository tokens) {
        this.tokens = tokens;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        UUID usuarioId;
        try {
            usuarioId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException | NullPointerException falha) {
            return invalido();
        }
        return jwt.getId() != null && tokens.estaAtivo(jwt.getId(), usuarioId, jwt.getClaimAsString("versaoRecuperacao"))
                ? OAuth2TokenValidatorResult.success() : invalido();
    }

    private OAuth2TokenValidatorResult invalido() {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token revogado.", null));
    }
}
