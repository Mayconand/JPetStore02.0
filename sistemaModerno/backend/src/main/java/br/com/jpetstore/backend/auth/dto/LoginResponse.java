package br.com.jpetstore.backend.auth.dto;

import br.com.jpetstore.backend.enums.PapelEnum;

import java.time.Instant;
import java.util.UUID;

public record LoginResponse(String token, String tipo, Instant expiraEm, UsuarioLogado usuario) {

    public record UsuarioLogado(UUID id, String nome, String email, PapelEnum papel) {
    }
}
