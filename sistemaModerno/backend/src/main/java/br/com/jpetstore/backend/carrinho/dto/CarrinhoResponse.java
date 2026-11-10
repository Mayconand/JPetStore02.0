package br.com.jpetstore.backend.carrinho.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * RF08 — itens e valores do carrinho. Cada animal é único: não há quantidade.
 * Itens com disponivel = false não entram no subtotal.
 */
public record CarrinhoResponse(
        UUID id,
        List<Item> itens,
        Cupom cupom,
        BigDecimal subtotal,
        BigDecimal desconto,
        BigDecimal total) {

    public record Item(
            UUID animalId,
            String nome,
            EspecieEnum especie,
            String raca,
            String imagemUrl,
            BigDecimal precoUnitario,
            boolean disponivel) {
    }

    public record Cupom(String codigo, BigDecimal percentualDesconto) {
    }
}
