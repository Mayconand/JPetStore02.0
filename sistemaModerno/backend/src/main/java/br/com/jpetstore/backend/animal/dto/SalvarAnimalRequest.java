package br.com.jpetstore.backend.animal.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.enums.GrupoEnum;
import br.com.jpetstore.backend.enums.PorteEnum;
import br.com.jpetstore.backend.enums.SexoEnum;
import br.com.jpetstore.backend.enums.TipoDeAgua;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Formulário de cadastro/edição do animal (RF23, RF27). Serve para as cinco espécies:
 * campos que não pertencem à espécie do animal são ignorados.
 *
 * Na edição, os campos do formulário são substituídos (null apaga o valor). As
 * exceções, mantidas quando null, são castrado, disponivel e tags. A espécie não muda.
 *
 * altura em centímetros; peso em quilos. imagensRemovidas e laudosRemovidos só valem na edição.
 */
public record SalvarAnimalRequest(
        EspecieEnum especie,
        @NotNull UUID racaId,
        @NotBlank @Size(max = 80) String nome,
        @NotNull @PositiveOrZero @Digits(integer = 8, fraction = 2) BigDecimal preco,
        @PastOrPresent LocalDate dataNascimento,
        @Size(max = 2000) String descricao,
        SexoEnum sexo,
        Boolean castrado,
        Boolean disponivel,
        // Cachorro, gato e réptil
        @Positive @Digits(integer = 4, fraction = 2) BigDecimal altura,
        @Positive @Digits(integer = 4, fraction = 3) BigDecimal peso,
        // Cachorro e gato
        PorteEnum porte,
        // Gato
        @Size(max = 80) String pelagem,
        // Pássaro
        @Size(max = 80) String plumagem,
        // Peixe
        TipoDeAgua tipoDeAgua,
        @Size(max = 80) String estirpe,
        @DecimalMin("0") @DecimalMax("14") BigDecimal ph,
        @Size(max = 80) String expectativaDeVida,
        // Réptil
        GrupoEnum grupo,
        @Size(max = 80) String mutacao,
        @Size(max = 5, message = "selecione até 5 tags") List<@NotBlank @Size(max = 40) String> tags,
        List<@NotNull UUID> imagensRemovidas,
        List<@NotNull UUID> laudosRemovidos) {
}
