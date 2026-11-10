package br.com.jpetstore.backend.animal.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Filtros da busca (RF07). Todos opcionais.
 * termo: procura em nome, descrição, raça e tags, sem diferenciar maiúsculas nem acentos.
 * especie: CACHORRO, GATO, PASSARO, PEIXE ou REPTIL (aceita "Cachorro", "Réptil"...).
 */
public record BuscaAnimaisFiltro(
        String termo,
        String especie,
        UUID racaId,
        String raca,
        BigDecimal precoMin,
        BigDecimal precoMax) {
}
