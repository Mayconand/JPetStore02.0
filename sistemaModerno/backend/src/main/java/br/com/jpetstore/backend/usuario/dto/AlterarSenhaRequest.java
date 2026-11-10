package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaRequest(
        @NotBlank String senhaAtual,
        @NotBlank @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres") String novaSenha) {
}
