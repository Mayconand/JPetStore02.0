package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.AlterarSenhaRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    /** RF03 — Realizar Cadastro (rota pública). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PerfilResponse cadastrar(@Valid @RequestBody CadastroRequest dados) {
        return service.cadastrar(dados);
    }

    /** RF04 — Visualizar Perfil. */
    @GetMapping("/me")
    public PerfilResponse perfil(@AuthenticationPrincipal Jwt jwt) {
        return service.obterPerfil(UsuarioAutenticado.id(jwt));
    }

    /** RF05 — Alterar Perfil. */
    @PutMapping("/me")
    public PerfilResponse alterarPerfil(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AlterarPerfilRequest dados) {
        return service.alterarPerfil(UsuarioAutenticado.id(jwt), dados);
    }

    /** RF05 — Alterar senha. */
    @PutMapping("/me/senha")
    public ResponseEntity<Void> alterarSenha(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AlterarSenhaRequest dados) {
        service.alterarSenha(UsuarioAutenticado.id(jwt), dados);
        return ResponseEntity.noContent().build();
    }
}
