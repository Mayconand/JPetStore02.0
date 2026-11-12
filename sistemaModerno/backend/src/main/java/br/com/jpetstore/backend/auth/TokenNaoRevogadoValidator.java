package br.com.jpetstore.backend.auth;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** Rejeita tokens que passaram pelo logout (RF10). */
@Component
public class TokenNaoRevogadoValidator implements OAuth2TokenValidator<Jwt> {

    private final TokenRepository tokens;

    public TokenNaoRevogadoValidator(TokenRepository tokens) {
        this.tokens = tokens;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (jwt.getId() == null || tokens.estaRevogado(jwt.getId())) {
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token revogado.", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
