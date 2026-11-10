package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

/** RF03 — o primeiro endereço da lista vira o endereço principal. */
public record CadastroRequest(
        @NotBlank String nome,
        @NotBlank String sobrenome,
        @NotBlank @Email String email,
        String telefone,
        @NotBlank @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres") String senha,
        @Pattern(regexp = "pt-BR|en|es", message = "Idioma deve ser pt-BR, en ou es") String idiomaPreferencial,
        Map<String, Object> preferencias,
        List<@Valid EnderecoRequest> enderecos) {
}
