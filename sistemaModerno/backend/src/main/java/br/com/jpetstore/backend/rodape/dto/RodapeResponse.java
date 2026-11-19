package br.com.jpetstore.backend.rodape.dto;

import java.time.OffsetDateTime;

public record RodapeResponse(boolean visivel, String conteudoHtml, OffsetDateTime atualizadoEm) {
}
