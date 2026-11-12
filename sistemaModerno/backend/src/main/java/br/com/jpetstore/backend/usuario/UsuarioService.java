package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.AlterarSenhaRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder senhas;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder senhas) {
        this.repository = repository;
        this.senhas = senhas;
    }

    /** RF03 — Realizar Cadastro. Todo novo usuário é CLIENTE. */
    public PerfilResponse cadastrar(CadastroRequest dados) {
        UUID id = repository.cadastrar(dados, senhas.encode(dados.senha()));
        return repository.obterPerfil(id);
    }

    /** RF04 — Visualizar Perfil. */
    public PerfilResponse obterPerfil(UUID usuarioId) {
        return repository.obterPerfil(usuarioId);
    }

    /** RF05 — Alterar Perfil. */
    public PerfilResponse alterarPerfil(UUID usuarioId, AlterarPerfilRequest dados) {
        return repository.alterarPerfil(usuarioId, dados);
    }

    /** RF05 — Alterar senha (exige a senha atual). */
    public void alterarSenha(UUID usuarioId, AlterarSenhaRequest dados) {
        Credenciais credenciais = repository.buscarCredenciaisPorId(usuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado."));
        if (!senhas.matches(dados.senhaAtual(), credenciais.senhaHash())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "SENHA_ATUAL_INCORRETA", "A senha atual está incorreta.");
        }
        repository.alterarSenha(usuarioId, senhas.encode(dados.novaSenha()));
    }
}
