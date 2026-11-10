package br.com.jpetstore.backend.usuario.dto;

import br.com.jpetstore.backend.enums.IdiomaEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Map;

/** RF05 — o papel do usuário nunca é alterado por esta rota. */
public record AlterarPerfilRequest(
        @NotBlank String nome,
        @NotBlank String sobrenome,
        @NotBlank @Email String email,
        String telefone,
        IdiomaEnum idiomaPreferencial,
        Map<String, Object> preferencias) {
}
