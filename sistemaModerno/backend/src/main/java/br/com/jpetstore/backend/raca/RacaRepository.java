package br.com.jpetstore.backend.raca;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.raca.dto.CadastrarRacaRequest;
import br.com.jpetstore.backend.raca.dto.EditarRacaRequest;
import br.com.jpetstore.backend.raca.dto.RacaResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class RacaRepository {

    private static final String RACAS = """
            (select r.id, r.especie, r.nome, r.descricao,
                    (select count(*) from jpetstore.animal a where a.raca_id = r.id) as quantidade_animais
               from jpetstore.raca r) racas
            """;

    private static final RowMapper<RacaResponse> LINHA = (rs, linha) -> new RacaResponse(
            rs.getObject("id", UUID.class),
            EspecieEnum.valueOf(rs.getString("especie")),
            rs.getString("nome"),
            rs.getString("descricao"),
            rs.getLong("quantidade_animais"));

    private final FuncoesBanco banco;

    public RacaRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    /** Filtros opcionais; a espécie e o termo ignoram acentos e maiúsculas. */
    public List<RacaResponse> listar(String especie, String termo) {
        String especieOuNulo = textoOuNulo(especie);
        String termoOuNulo = textoOuNulo(termo);
        return banco.linhas(RACAS + """
                where (?::text is null or especie = upper(jpetstore.fn_normalizar(?)))
                  and (?::text is null or position(jpetstore.fn_normalizar(?) in jpetstore.fn_normalizar(nome)) > 0)
                order by especie, nome
                """, LINHA, especieOuNulo, especieOuNulo, termoOuNulo, termoOuNulo);
    }

    public RacaResponse obter(UUID id) {
        return banco.linhas(RACAS + "where id = ?", LINHA, id).stream().findFirst().orElseThrow(RacaRepository::naoEncontrada);
    }

    public UUID cadastrar(CadastrarRacaRequest dados) {
        return banco.valor("jpetstore.fn_cadastrar_raca(?, ?, ?)", UUID.class,
                dados.especie().name(), dados.nome(), dados.descricao());
    }

    public void editar(UUID id, EditarRacaRequest dados) {
        try {
            int alteradas = banco.alterar("update jpetstore.raca set nome = ?, descricao = ? where id = ?",
                    dados.nome().strip(), textoOuNulo(dados.descricao()), id);
            exigirUma(alteradas);
        } catch (DuplicateKeyException e) {
            throw new ApiException(HttpStatus.CONFLICT, "RACA_JA_CADASTRADA", "Já existe uma raça com esse nome nesta espécie.");
        }
    }

    public void excluir(UUID id) {
        try {
            exigirUma(banco.alterar("delete from jpetstore.raca where id = ?", id));
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(HttpStatus.CONFLICT, "RACA_EM_USO",
                    "Existem animais desta raça; altere ou exclua esses animais antes.");
        }
    }

    private static void exigirUma(int linhas) {
        if (linhas == 0) {
            throw naoEncontrada();
        }
    }

    private static ApiException naoEncontrada() {
        return new ApiException(HttpStatus.NOT_FOUND, "RACA_NAO_ENCONTRADA", "Raça não encontrada.");
    }

    private static String textoOuNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.strip();
    }
}
