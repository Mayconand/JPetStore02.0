package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Endereço único: usado para entrega e cobrança. */
public record EnderecoRequest(
        String rua,
        String numero,
        String complemento,
        String bairro,
        @NotBlank String cidade,
        @NotBlank String estado,
        @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve ter 8 dígitos") String cep,
        String pais) {
}
