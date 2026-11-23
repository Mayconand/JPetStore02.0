package br.com.jpetstore.backend.cliente;

import br.com.jpetstore.backend.cliente.dto.ClienteResumo;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    /** RF25 — Ver Clientes que realizaram pedidos, do pedido mais recente para o mais antigo. */
    @GetMapping
    public List<ClienteResumo> listar(@AuthenticationPrincipal Jwt jwt) {
        return service.listar(UsuarioAutenticado.id(jwt));
    }
}
