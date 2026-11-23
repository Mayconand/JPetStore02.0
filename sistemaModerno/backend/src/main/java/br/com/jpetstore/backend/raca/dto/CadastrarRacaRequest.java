package br.com.jpetstore.backend.raca.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CadastrarRacaRequest(
        @NotNull EspecieEnum especie,
        @NotBlank @Size(max = 80) String nome,
        @Size(max = 500) String descricao) {
}
