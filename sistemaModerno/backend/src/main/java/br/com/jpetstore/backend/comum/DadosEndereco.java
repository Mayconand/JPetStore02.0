package br.com.jpetstore.backend.comum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Os dados de um Endereço (o mesmo serve para entrega e cobrança). Usado ao
 * cadastrar Endereços, ao exibi-los no Perfil e como cópia gravada no Pedido.
 */
public record DadosEndereco(
        String rua,
        String numero,
        String complemento,
        String bairro,
        @NotBlank String cidade,
        @NotBlank String estado,
        @NotBlank @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve ter 8 dígitos") String cep,
        String pais) {
}
