package br.com.jpetstore.backend.rodape.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PersonalizarRodapeRequest(@NotNull @Size(max = 20000) String conteudoHtml) {
}
