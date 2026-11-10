package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

/** RF05 — o papel do usuário nunca é alterado por esta rota. */
public record AlterarPerfilRequest(
        @NotBlank String nome,
        @NotBlank String sobrenome,
        @NotBlank @Email String email,
        String telefone,
        @Pattern(regexp = "pt-BR|en|es", message = "Idioma deve ser pt-BR, en ou es") String idiomaPreferencial,
        Map<String, Object> preferencias) {
}
