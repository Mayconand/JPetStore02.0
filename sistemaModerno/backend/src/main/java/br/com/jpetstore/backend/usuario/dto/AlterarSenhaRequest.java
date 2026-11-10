package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;

public record AlterarSenhaRequest(
        @NotBlank String senhaAtual,
        @Senha String novaSenha) {
}
