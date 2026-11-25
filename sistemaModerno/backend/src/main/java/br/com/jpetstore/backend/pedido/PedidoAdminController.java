package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;
import br.com.jpetstore.backend.pedido.dto.FiltroPedidos;
import br.com.jpetstore.backend.pedido.dto.PedidoAdminResumo;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/pedidos")
public class PedidoAdminController {

    private final PedidoAdminService service;

    public PedidoAdminController(PedidoAdminService service) {
        this.service = service;
    }

    public record AlterarStatus(@NotNull StatusPedidoEnum status) { }

    @PutMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarStatus(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                              @Valid @RequestBody AlterarStatus dados) {
        service.alterarStatus(UsuarioAutenticado.id(jwt), id, dados.status());
    }

    /** RF30 — Filtrar pedidos por status, período (datas inclusivas) e cliente. */
    @GetMapping
    public List<PedidoAdminResumo> filtrar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) StatusPedidoEnum status,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate fim,
            @RequestParam(required = false) UUID clienteId) {
        return service.filtrar(UsuarioAutenticado.id(jwt), new FiltroPedidos(status, inicio, fim, clienteId));
    }
}
