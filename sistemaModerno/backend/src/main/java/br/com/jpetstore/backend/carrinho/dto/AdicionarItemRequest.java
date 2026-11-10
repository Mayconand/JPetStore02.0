package br.com.jpetstore.backend.carrinho.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AdicionarItemRequest(@NotNull UUID animalId) {
}
