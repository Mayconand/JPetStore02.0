package br.com.jpetstore.backend.pedido.dto;

import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PedidoResumo(
        UUID id,
        OffsetDateTime dataCriacao,
        StatusPedidoEnum status,
        ModalidadeEntregaEnum modalidade,
        BigDecimal valorTotal,
        int quantidadeItens) {
}
