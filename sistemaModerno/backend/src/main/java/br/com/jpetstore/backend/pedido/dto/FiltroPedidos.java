package br.com.jpetstore.backend.pedido.dto;

import br.com.jpetstore.backend.enums.StatusPedidoEnum;

import java.time.LocalDate;
import java.util.UUID;

/** RF30 — todos opcionais. O período inclui as duas datas. */
public record FiltroPedidos(StatusPedidoEnum status, LocalDate inicio, LocalDate fim, UUID clienteId) {
}
