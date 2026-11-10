package br.com.jpetstore.backend.comum;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/** Extrai dados do usuário autenticado a partir do JWT (o "sub" é o id do usuário). */
public final class UsuarioAutenticado {

    private UsuarioAutenticado() {
    }

    public static UUID id(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
