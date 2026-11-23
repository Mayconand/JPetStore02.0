package br.com.jpetstore.backend.raca;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.raca.dto.CadastrarRacaRequest;
import br.com.jpetstore.backend.raca.dto.EditarRacaRequest;
import br.com.jpetstore.backend.raca.dto.RacaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/** RF24 — Cadastrar Raça (e listar, editar e excluir). Somente administrador. */
@RestController
@RequestMapping("/api/admin/racas")
public class RacaController {

    private final RacaService service;

    public RacaController(RacaService service) {
        this.service = service;
    }

    @GetMapping
    public List<RacaResponse> listar(@AuthenticationPrincipal Jwt jwt,
                                     @RequestParam(required = false) String especie,
                                     @RequestParam(required = false) String termo) {
        return service.listar(UsuarioAutenticado.id(jwt), especie, termo);
    }

    @GetMapping("/{id}")
    public RacaResponse obter(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.obter(UsuarioAutenticado.id(jwt), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RacaResponse cadastrar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CadastrarRacaRequest dados) {
        return service.cadastrar(UsuarioAutenticado.id(jwt), dados);
    }

    @PutMapping("/{id}")
    public RacaResponse editar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                               @Valid @RequestBody EditarRacaRequest dados) {
        return service.editar(UsuarioAutenticado.id(jwt), id, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluir(UsuarioAutenticado.id(jwt), id);
    }
}
