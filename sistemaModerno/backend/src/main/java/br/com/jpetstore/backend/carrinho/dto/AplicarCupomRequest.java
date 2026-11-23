package br.com.jpetstore.backend.carrinho.dto;

import jakarta.validation.constraints.NotBlank;

public record AplicarCupomRequest(@NotBlank String codigo) {
}
