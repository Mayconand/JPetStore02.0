package br.com.jpetstore.backend.auth;

import br.com.jpetstore.backend.usuario.dto.Senha;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class RecuperacaoSenhaController {
    private final RecuperacaoSenhaService service;

    public RecuperacaoSenhaController(RecuperacaoSenhaService service) {
        this.service = service;
    }

    public record Solicitacao(@NotBlank @Email @Size(max = 254) String email) { }

    public record Redefinicao(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{43}") String token,
                              @Senha String novaSenha) { }

    @PostMapping("/recuperar-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void solicitar(@Valid @RequestBody Solicitacao dados) {
        service.solicitar(dados.email());
    }

    @PostMapping("/redefinir-senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void redefinir(@Valid @RequestBody Redefinicao dados) {
        service.redefinir(dados.token(), dados.novaSenha());
    }
}
