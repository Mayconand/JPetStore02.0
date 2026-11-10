package br.com.jpetstore.backend.auth;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.UUID;

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

    /** Remove da lista de revogados os tokens que já expiraram (a cada hora). */
    @Scheduled(fixedDelay = 3_600_000, initialDelay = 60_000)
    public void limparExpirados() {
        banco.valor("jpetstore.fn_limpar_tokens_expirados()", Integer.class);
    }
}
