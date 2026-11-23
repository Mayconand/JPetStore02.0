package br.com.jpetstore.backend.raca.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;

import java.util.UUID;

public record RacaResponse(UUID id, EspecieEnum especie, String nome, String descricao, long quantidadeAnimais) {
}
