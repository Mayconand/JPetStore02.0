package br.com.jpetstore.backend.usuario.dto;

import java.util.UUID;

public record EnderecoResponse(
        UUID id,
        String rua,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep,
        String pais,
        boolean principal) {
}
