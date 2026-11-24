package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.pedido.dto.CriarPedidoRequest;
import br.com.jpetstore.backend.pedido.dto.PedidoResponse;
import br.com.jpetstore.backend.pedido.dto.PedidoResumo;
import br.com.jpetstore.backend.pedido.dto.RealizarPagamentoRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    /** RF06 — Visualizar Pedidos. */
    public List<PedidoResumo> listar(UUID usuarioId) {
        return repository.listar(usuarioId);
    }

    /** RF06 — detalhe de um pedido do próprio usuário. */
    public PedidoResponse obter(UUID usuarioId, UUID pedidoId) {
        return repository.obter(usuarioId, pedidoId);
    }

    /** RF12 — Cria o pedido a partir do carrinho. */
    public PedidoResponse criar(UUID usuarioId, CriarPedidoRequest request) {
        UUID pedidoId = repository.criar(usuarioId, request.modalidade(), request.enderecoId());
        return repository.obter(usuarioId, pedidoId);
    }

    /** RF14 — Usa a simulação já existente no banco; não realiza cobrança. */
    @Transactional
    public PedidoResponse pagar(UUID usuarioId, UUID pedidoId, RealizarPagamentoRequest dados) {
        var cobranca = dados.enderecoCobranca();
        if (cobranca != null && (cobranca.rua() == null || cobranca.rua().isBlank()
                || cobranca.numero() == null || cobranca.numero().isBlank())) {
            throw new br.com.jpetstore.backend.comum.ApiException(org.springframework.http.HttpStatus.UNPROCESSABLE_CONTENT,
                    "ENDERECO_COBRANCA_INCOMPLETO", "Informe rua e número no endereço de cobrança.");
        }
        repository.pagar(usuarioId, pedidoId, dados);
        return repository.obter(usuarioId, pedidoId);
    }

    /** Cancela o pedido (somente o dono, antes do envio). */
    public PedidoResponse cancelar(UUID usuarioId, UUID pedidoId) {
        return repository.cancelar(usuarioId, pedidoId);
    }
}
