package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.usuario.dto.AlterarPerfilRequest;
import br.com.jpetstore.backend.usuario.dto.CadastroRequest;
import br.com.jpetstore.backend.usuario.dto.PerfilResponse;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Acesso às funções de banco do módulo de usuário (RF03, RF04, RF05). */
@Repository
public class UsuarioRepository {

    private final FuncoesBanco banco;

    public UsuarioRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public UUID cadastrar(CadastroRequest dados, String senhaHash) {
        return banco.valor("jpetstore.fn_cadastrar_usuario(?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb)", UUID.class,
                dados.nome(), dados.sobrenome(), dados.email(), dados.telefone(), senhaHash,
                dados.idiomaPreferencial() != null ? dados.idiomaPreferencial() : "pt-BR",
                banco.paraJson(dados.preferencias() != null ? dados.preferencias() : Map.of()),
                banco.paraJson(dados.enderecos() != null ? dados.enderecos() : List.of()));
    }

    public PerfilResponse obterPerfil(UUID usuarioId) {
        return banco.json("jpetstore.fn_obter_perfil(?)", PerfilResponse.class, usuarioId);
    }

    public PerfilResponse alterarPerfil(UUID usuarioId, AlterarPerfilRequest dados) {
        return banco.json("jpetstore.fn_alterar_perfil(?, ?, ?, ?, ?, ?, ?::jsonb)", PerfilResponse.class,
                usuarioId, dados.nome(), dados.sobrenome(), dados.email(), dados.telefone(),
                dados.idiomaPreferencial(), banco.paraJson(dados.preferencias()));
    }

    public void alterarSenha(UUID usuarioId, String senhaHash) {
        banco.executar("jpetstore.fn_alterar_senha(?, ?)", usuarioId, senhaHash);
    }
}
