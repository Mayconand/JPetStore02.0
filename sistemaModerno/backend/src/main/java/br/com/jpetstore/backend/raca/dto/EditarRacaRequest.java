package br.com.jpetstore.backend.raca.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** A espécie da raça não muda. */
public record EditarRacaRequest(
        @NotBlank @Size(max = 80) String nome,
        @Size(max = 500) String descricao) {
}
