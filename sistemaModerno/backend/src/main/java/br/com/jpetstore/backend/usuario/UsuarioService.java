package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.DadosEndereco;
import br.com.jpetstore.backend.enums.IdiomaEnum;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.AlterarSenhaRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import br.com.jpetstore.backend.usuario.dto.CadastrarCartaoRequest;
import br.com.jpetstore.backend.usuario.dto.EnderecoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
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
        if (dados.enderecos() != null) {
            dados.enderecos().forEach(UsuarioService::exigirRuaENumero);
        }
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

    public PerfilResponse selecionarIdioma(UUID usuarioId, IdiomaEnum idioma) {
        repository.selecionarIdioma(usuarioId, idioma);
        return repository.obterPerfil(usuarioId);
    }

    public UUID cadastrarCartao(UUID usuarioId, CadastrarCartaoRequest dados) {
        return repository.cadastrarCartao(usuarioId, dados);
    }

    public List<EnderecoResponse> listarEnderecos(UUID usuarioId) {
        return repository.listarEnderecos(usuarioId);
    }

    public UUID cadastrarEndereco(UUID usuarioId, DadosEndereco dados) {
        exigirRuaENumero(dados);
        return repository.cadastrarEndereco(usuarioId, dados);
    }

    public EnderecoResponse editarEndereco(UUID usuarioId, UUID enderecoId, DadosEndereco dados) {
        exigirRuaENumero(dados);
        return repository.editarEndereco(usuarioId, enderecoId, dados);
    }

    public void removerEndereco(UUID usuarioId, UUID enderecoId) {
        repository.removerEndereco(usuarioId, enderecoId);
    }

    private static void exigirRuaENumero(DadosEndereco dados) {
        if (dados == null || dados.rua() == null || dados.rua().isBlank() || dados.numero() == null || dados.numero().isBlank()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "ENDERECO_INCOMPLETO",
                    "Informe a rua e o número para a entrega.");
        }
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
