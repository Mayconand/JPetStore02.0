package br.com.jpetstore.backend.auth;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

/** Lista de tokens revogados pelo logout (RF10). */
@Repository
public class TokenRepository {

    private final FuncoesBanco banco;

    public TokenRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public void revogar(String jti, UUID usuarioId, Instant expiraEm) {
        banco.executar("jpetstore.fn_revogar_token(?, ?, ?)", jti, usuarioId, Timestamp.from(expiraEm));
    }

    public boolean estaRevogado(String jti) {
        return Boolean.TRUE.equals(banco.valor("jpetstore.fn_token_revogado(?)", Boolean.class, jti));
    }

    /** Remove da lista os tokens que já expiraram; devolve quantos foram removidos. */
    public int limparExpirados() {
        return banco.valor("jpetstore.fn_limpar_tokens_expirados()", Integer.class);
    }
}
