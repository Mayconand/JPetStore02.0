package br.com.jpetstore.backend.auth;

import br.com.jpetstore.backend.auth.dto.LoginRequest;
import br.com.jpetstore.backend.auth.dto.LoginResponse;
import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.usuario.Credenciais;
import br.com.jpetstore.backend.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder senhas;
    private final TokenService tokenService;
    private final TokenRepository tokens;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder senhas, TokenService tokenService, TokenRepository tokens) {
        this.usuarios = usuarios;
        this.senhas = senhas;
        this.tokenService = tokenService;
        this.tokens = tokens;
    }

    /** RF02 — mesma resposta para email inexistente e senha errada (não revela quais emails existem). */
    public LoginResponse login(LoginRequest request) {
        Credenciais usuario = usuarios.buscarCredenciaisPorEmail(request.email())
                .filter(u -> senhas.matches(request.senha(), u.senhaHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "CREDENCIAIS_INVALIDAS", "Email ou senha inválidos."));

        TokenService.TokenEmitido emitido = tokenService.emitir(usuario);
        return new LoginResponse(emitido.token(), "Bearer", emitido.expiraEm(),
                new LoginResponse.UsuarioLogado(usuario.id(), usuario.nome(), usuario.email(), usuario.papel()));
    }

    /** RF10 — o token atual deixa de ser aceito, mesmo antes de expirar. */
    public void logout(Jwt jwt) {
        tokens.revogar(jwt.getId(), UsuarioAutenticado.id(jwt), jwt.getExpiresAt());
    }
}
