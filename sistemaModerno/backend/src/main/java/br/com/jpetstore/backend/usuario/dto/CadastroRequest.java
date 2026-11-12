package br.com.jpetstore.backend.usuario.dto;

import br.com.jpetstore.backend.comum.DadosEndereco;
import br.com.jpetstore.backend.enums.IdiomaEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

/** RF03 — o primeiro endereço da lista vira o endereço principal. */
public record CadastroRequest(
        @NotBlank String nome,
        @NotBlank String sobrenome,
        @NotBlank @Email String email,
        String telefone,
        @Senha String senha,
        IdiomaEnum idiomaPreferencial,
        Map<String, Object> preferencias,
        List<@Valid DadosEndereco> enderecos) {
}
