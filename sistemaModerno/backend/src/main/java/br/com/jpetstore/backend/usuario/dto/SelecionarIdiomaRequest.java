package br.com.jpetstore.backend.usuario.dto;

import br.com.jpetstore.backend.enums.IdiomaEnum;
import jakarta.validation.constraints.NotNull;

public record SelecionarIdiomaRequest(@NotNull IdiomaEnum idiomaPreferencial) {
}
