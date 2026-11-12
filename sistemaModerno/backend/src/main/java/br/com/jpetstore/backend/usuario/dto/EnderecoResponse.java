package br.com.jpetstore.backend.usuario.dto;

import br.com.jpetstore.backend.comum.DadosEndereco;
import com.fasterxml.jackson.annotation.JsonUnwrapped;

import java.util.UUID;

/** Endereço cadastrado do Usuário. No JSON os dados do endereço ficam no mesmo nível de id e principal. */
public record EnderecoResponse(
        UUID id,
        boolean principal,
        @JsonUnwrapped DadosEndereco dados) {
}
