package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.dto.AnimalResumo;
import br.com.jpetstore.backend.animal.dto.BuscaAnimaisFiltro;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.enums.SexoEnum;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Repository
public class AnimalRepository {

    private final FuncoesBanco banco;

    public AnimalRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    /** Resultado de uma página da busca, com o total de animais encontrados. */
    public record ResultadoBusca(List<AnimalResumo> animais, long total) {
    }

    public ResultadoBusca buscar(BuscaAnimaisFiltro filtro, int limite, int offset) {
        long[] total = {0};
        List<AnimalResumo> animais = banco.linhas(
                "jpetstore.fn_buscar_animais(?, ?, ?, ?, ?, ?, ?, ?)",
                (rs, linha) -> {
                    total[0] = rs.getLong("total");
                    String sexo = rs.getString("sexo");
                    Array tags = rs.getArray("tags");
                    return new AnimalResumo(
                            rs.getObject("id", UUID.class),
                            rs.getString("nome"),
                            EspecieEnum.valueOf(rs.getString("especie")),
                            rs.getObject("raca_id", UUID.class),
                            rs.getString("raca"),
                            rs.getObject("data_nascimento", LocalDate.class),
                            sexo != null ? SexoEnum.valueOf(sexo) : null,
                            rs.getBoolean("castrado"),
                            rs.getBigDecimal("preco"),
                            rs.getString("descricao"),
                            rs.getString("imagem_url"),
                            tags != null ? Arrays.asList((String[]) tags.getArray()) : List.of());
                },
                filtro.termo(), filtro.especie(), filtro.racaId(), filtro.raca(),
                filtro.precoMin(), filtro.precoMax(), limite, offset);
        return new ResultadoBusca(animais, total[0]);
    }
}
