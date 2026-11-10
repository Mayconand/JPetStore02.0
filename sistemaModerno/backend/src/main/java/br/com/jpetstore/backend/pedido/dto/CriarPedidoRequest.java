package br.com.jpetstore.backend.pedido.dto;

import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** enderecoId é obrigatório quando a modalidade é ENTREGA e ignorado em RETIRADA. */
public record CriarPedidoRequest(@NotNull ModalidadeEntregaEnum modalidade, UUID enderecoId) {
}
