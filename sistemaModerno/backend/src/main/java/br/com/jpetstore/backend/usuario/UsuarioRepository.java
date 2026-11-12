package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.IdiomaEnum;
import br.com.jpetstore.backend.enums.PapelEnum;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Acesso às funções de banco do módulo de usuário (RF02, RF03, RF04, RF05). */
@Repository
public class UsuarioRepository {

    private static final RowMapper<Credenciais> CREDENCIAIS = (rs, linha) -> new Credenciais(
            rs.getObject("id", UUID.class),
            rs.getString("nome"),
            rs.getString("email"),
            rs.getString("senha_hash"),
            PapelEnum.valueOf(rs.getString("papel")));

    private final FuncoesBanco banco;

    public UsuarioRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public Optional<Credenciais> buscarCredenciaisPorEmail(String email) {
        return banco.linhas("jpetstore.fn_buscar_usuario_login(?)", CREDENCIAIS, email).stream().findFirst();
    }

    public Optional<Credenciais> buscarCredenciaisPorId(UUID usuarioId) {
        return banco.linhas("jpetstore.fn_buscar_usuario_por_id(?)", CREDENCIAIS, usuarioId).stream().findFirst();
    }

    public UUID cadastrar(CadastroRequest dados, String senhaHash) {
        return banco.valor("jpetstore.fn_cadastrar_usuario(?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)", UUID.class,
                dados.nome(), dados.sobrenome(), dados.email(), dados.telefone(), senhaHash,
                codigo(dados.idiomaPreferencial() != null ? dados.idiomaPreferencial() : IdiomaEnum.PT_BR),
                banco.paraJson(dados.preferencias() != null ? dados.preferencias() : Map.of()),
                banco.paraJson(dados.enderecos() != null ? dados.enderecos() : List.of()));
    }

    public PerfilResponse obterPerfil(UUID usuarioId) {
        return banco.json("jpetstore.fn_obter_perfil(?)", PerfilResponse.class, usuarioId);
    }

    public PerfilResponse alterarPerfil(UUID usuarioId, AlterarPerfilRequest dados) {
        return banco.json("jpetstore.fn_alterar_perfil(?, ?, ?, ?, ?, ?, ?::jsonb)", PerfilResponse.class,
                usuarioId, dados.nome(), dados.sobrenome(), dados.email(), dados.telefone(),
                codigo(dados.idiomaPreferencial()), banco.paraJson(dados.preferencias()));
    }

    public void alterarSenha(UUID usuarioId, String senhaHash) {
        banco.executar("jpetstore.fn_alterar_senha(?, ?)", usuarioId, senhaHash);
    }

    private static String codigo(IdiomaEnum idioma) {
        return idioma != null ? idioma.getCodigo() : null;
    }
}
