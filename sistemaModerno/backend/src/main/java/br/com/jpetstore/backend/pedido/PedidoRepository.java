package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import br.com.jpetstore.backend.pedido.dto.PedidoResponse;
import br.com.jpetstore.backend.pedido.dto.PedidoResumo;
import br.com.jpetstore.backend.pedido.dto.RealizarPagamentoRequest;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Repository
public class PedidoRepository {

    private final FuncoesBanco banco;

    public PedidoRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public List<PedidoResumo> listar(UUID usuarioId) {
        return Arrays.asList(banco.json("jpetstore.fn_listar_pedidos_usuario(?)", PedidoResumo[].class, usuarioId));
    }

    public PedidoResponse obter(UUID usuarioId, UUID pedidoId) {
        return banco.json("jpetstore.fn_obter_pedido(?, ?)", PedidoResponse.class, usuarioId, pedidoId);
    }

    public UUID criar(UUID usuarioId, ModalidadeEntregaEnum modalidade, UUID enderecoId) {
        return banco.valor("jpetstore.fn_criar_pedido(?, ?::jpetstore.modalidade_entrega, ?)", UUID.class,
                usuarioId, modalidade.name(), enderecoId);
    }

    public PedidoResponse cancelar(UUID usuarioId, UUID pedidoId) {
        return banco.json("jpetstore.fn_cancelar_pedido(?, ?)", PedidoResponse.class, usuarioId, pedidoId);
    }

    public void pagar(UUID usuarioId, UUID pedidoId, RealizarPagamentoRequest dados) {
        banco.executar("jpetstore.fn_realizar_pagamento(?, ?, ?::jpetstore.forma_pagamento, ?)",
                usuarioId, pedidoId, dados.forma().name(), dados.cartaoId());
        if (dados.enderecoCobranca() != null) {
            banco.alterar("update jpetstore.pedido set endereco_cobranca = ?::jsonb where id = ? and usuario_id = ?",
                    banco.paraJson(dados.enderecoCobranca()), pedidoId, usuarioId);
        }
    }
}
