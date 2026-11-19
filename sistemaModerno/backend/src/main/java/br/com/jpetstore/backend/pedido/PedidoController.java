package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.pedido.dto.CriarPedidoRequest;
import br.com.jpetstore.backend.pedido.dto.PedidoResponse;
import br.com.jpetstore.backend.pedido.dto.PedidoResumo;
import br.com.jpetstore.backend.pedido.dto.RealizarPagamentoRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    /** RF06 — Visualizar Pedidos. */
    @GetMapping
    public List<PedidoResumo> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAutenticado.id(jwt));
    }

    /** RF06 — Detalhe do pedido. */
    @GetMapping("/{id}")
    public PedidoResponse obter(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.obter(UsuarioAutenticado.id(jwt), id);
    }

    /** RF12 — Finaliza o carrinho, criando um pedido que aguarda pagamento. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CriarPedidoRequest request) {
        return service.criar(UsuarioAutenticado.id(jwt), request);
    }

    /** RF14 — Simula a aprovação do pagamento e retorna o pedido atualizado. */
    @PostMapping("/{id}/pagamento")
    public PedidoResponse pagar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                @Valid @RequestBody RealizarPagamentoRequest dados) {
        return service.pagar(UsuarioAutenticado.id(jwt), id, dados);
    }

    /** Cancelar Pedido (spec: só o dono, antes do envio; complementa RF06). */
    @PostMapping("/{id}/cancelar")
    public PedidoResponse cancelar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.cancelar(UsuarioAutenticado.id(jwt), id);
    }
}
