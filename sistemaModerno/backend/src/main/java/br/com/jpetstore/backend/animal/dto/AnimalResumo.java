package br.com.jpetstore.backend.animal.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.enums.SexoEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Item de resultado da busca de animais (somente disponíveis). */
public record AnimalResumo(
        UUID id,
        String nome,
        EspecieEnum especie,
        UUID racaId,
        String raca,
        LocalDate dataNascimento,
        SexoEnum sexo,
        boolean castrado,
        BigDecimal preco,
        String descricao,
        String imagemUrl,
        List<String> tags) {
}
