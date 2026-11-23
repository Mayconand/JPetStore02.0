package br.com.jpetstore.backend.cliente.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/** RF25 — cliente que já fez pedidos. Quantidade e valor não contam pedidos cancelados. */
public record ClienteResumo(
        UUID id, String nome, String sobrenome, String email, String telefone,
        long quantidadePedidos, BigDecimal valorTotalGasto, OffsetDateTime ultimoPedido) {
}
