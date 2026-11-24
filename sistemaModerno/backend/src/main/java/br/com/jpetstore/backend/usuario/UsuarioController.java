package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.comum.DadosEndereco;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.AlterarSenhaRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import br.com.jpetstore.backend.usuario.dto.SelecionarIdiomaRequest;
import br.com.jpetstore.backend.usuario.dto.CadastrarCartaoRequest;
import br.com.jpetstore.backend.usuario.dto.EnderecoResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    /** RF11 — Salva a preferência de idioma, sem alterar os outros dados do perfil. */
    @PutMapping("/me/idioma")
    public PerfilResponse selecionarIdioma(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody SelecionarIdiomaRequest dados) {
        return service.selecionarIdioma(UsuarioAutenticado.id(jwt), dados.idiomaPreferencial());
    }

    /** RF13 — Cadastra um cartão fictício para o pagamento simulado. */
    @PostMapping("/me/cartoes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, UUID> cadastrarCartao(@AuthenticationPrincipal Jwt jwt,
                                            @Valid @RequestBody CadastrarCartaoRequest dados) {
        return Map.of("id", service.cadastrarCartao(UsuarioAutenticado.id(jwt), dados));
    }

    @GetMapping("/me/enderecos")
    public List<EnderecoResponse> listarEnderecos(@AuthenticationPrincipal Jwt jwt) {
        return service.listarEnderecos(UsuarioAutenticado.id(jwt));
    }

    /**
     * RF15 — Cadastra um endereço completo de entrega para o próprio usuário.
     * RF21 — A partir do segundo, é um endereço alternativo: o principal não muda.
     */
    @PostMapping("/me/enderecos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, UUID> cadastrarEndereco(@AuthenticationPrincipal Jwt jwt,
                                              @Valid @RequestBody DadosEndereco dados) {
        return Map.of("id", service.cadastrarEndereco(UsuarioAutenticado.id(jwt), dados));
    }

    /** RF21 — Corrige um endereço do próprio usuário (o principal não muda). */
    @PutMapping("/me/enderecos/{id}")
    public EnderecoResponse editarEndereco(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                           @Valid @RequestBody DadosEndereco dados) {
        return service.editarEndereco(UsuarioAutenticado.id(jwt), id, dados);
    }

    @DeleteMapping("/me/enderecos/{id}")
    public ResponseEntity<Void> removerEndereco(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.removerEndereco(UsuarioAutenticado.id(jwt), id);
        return ResponseEntity.noContent().build();
    }

    /** RF05 — Alterar senha. */
    @PutMapping("/me/senha")
    public ResponseEntity<Void> alterarSenha(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AlterarSenhaRequest dados) {
        service.alterarSenha(UsuarioAutenticado.id(jwt), dados);
        return ResponseEntity.noContent().build();
    }
}
