package br.com.jpetstore.backend.pedido.dto;

import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Pedido na visão do administrador. animais = nomes separados por vírgula. */
public record PedidoAdminResumo(
        UUID id, UUID clienteId, String cliente, String email, OffsetDateTime dataCriacao,
        StatusPedidoEnum status, ModalidadeEntregaEnum modalidade,
        BigDecimal valorTotal, int quantidadeItens, String animais) {
}
