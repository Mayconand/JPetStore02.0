package br.com.jpetstore.backend.auth;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Tarefa periódica: tira da lista de revogados os tokens que já expiraram (a cada hora). */
@Component
public class LimpezaDeTokens {

    private final TokenRepository tokens;

    public LimpezaDeTokens(TokenRepository tokens) {
        this.tokens = tokens;
    }

    @Scheduled(fixedDelay = 3_600_000, initialDelay = 60_000)
    public void executar() {
        tokens.limparExpirados();
    }
}
