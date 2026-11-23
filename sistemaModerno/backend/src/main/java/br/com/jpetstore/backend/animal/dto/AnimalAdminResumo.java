package br.com.jpetstore.backend.animal.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/** Item da lista de animais do painel administrativo (inclui indisponíveis). */
public record AnimalAdminResumo(
        UUID id, String nome, EspecieEnum especie, UUID racaId, String raca,
        LocalDate dataNascimento, BigDecimal preco, boolean disponivel,
        Map<String, Object> atributos, int quantidadeLaudos) {
}
