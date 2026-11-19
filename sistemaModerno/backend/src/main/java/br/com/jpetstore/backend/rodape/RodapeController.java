package br.com.jpetstore.backend.rodape;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.rodape.dto.PersonalizarRodapeRequest;
import br.com.jpetstore.backend.rodape.dto.RodapeResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
public class RodapeController {
    private final RodapeService service;

    public RodapeController(RodapeService service) {
        this.service = service;
    }

    @GetMapping("/api/rodape")
    public RodapeResponse obter() {
        return service.obter();
    }

    /** RF18 — Somente um administrador pode alterar o rodapé da plataforma. */
    @PostMapping("/api/admin/rodape/desabilitar")
    public RodapeResponse desabilitar(@AuthenticationPrincipal Jwt jwt) {
        return service.desabilitar(UsuarioAutenticado.id(jwt));
    }

    /** RF19 — Reexibe o rodapé, preservando seu conteúdo. */
    @PostMapping("/api/admin/rodape/habilitar")
    public RodapeResponse habilitar(@AuthenticationPrincipal Jwt jwt) {
        return service.habilitar(UsuarioAutenticado.id(jwt));
    }

    /** RF20 — Altera o conteúdo, preservando a visibilidade atual. */
    @PutMapping("/api/admin/rodape")
    public RodapeResponse personalizar(@AuthenticationPrincipal Jwt jwt,
                                       @Valid @RequestBody PersonalizarRodapeRequest dados) {
        return service.personalizar(UsuarioAutenticado.id(jwt), dados.conteudoHtml());
    }
}
