package br.com.jpetstore.backend.pedido.dto;

import br.com.jpetstore.backend.comum.DadosEndereco;
import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Pedido completo. enderecoEntrega é a cópia do endereço no momento da compra (null em RETIRADA). */
public record PedidoResponse(
        UUID id,
        OffsetDateTime dataCriacao,
        StatusPedidoEnum status,
        ModalidadeEntregaEnum modalidade,
        DadosEndereco enderecoEntrega,
        String cupom,
        BigDecimal valorItens,
        BigDecimal valorDesconto,
        BigDecimal valorTotal,
        OffsetDateTime canceladoEm,
        List<Item> itens) {

    public record Item(UUID animalId, String nome, BigDecimal precoUnitario, String imagemUrl) {
    }
}
