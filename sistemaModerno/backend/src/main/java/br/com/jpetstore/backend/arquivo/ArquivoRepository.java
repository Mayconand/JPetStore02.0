package br.com.jpetstore.backend.arquivo;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Único ponto que sabe onde os arquivos ficam: no banco, na tabela "arquivo".
 * Para mudar de armazenamento, basta trocar esta classe.
 */
@Repository
public class ArquivoRepository {

    private static final RowMapper<Arquivo> LINHA = (rs, linha) ->
            new Arquivo(rs.getString("nome"), rs.getString("tipo_conteudo"), rs.getBytes("conteudo"));

    private final FuncoesBanco banco;

    public ArquivoRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public void adicionarImagem(UUID animalId, boolean principal, Arquivo imagem) {
        banco.executar("jpetstore.fn_adicionar_imagem_animal(?, ?, ?, ?, ?)",
                animalId, principal, imagem.nome(), imagem.tipoConteudo(), imagem.conteudo());
    }

    public void adicionarLaudo(UUID animalId, Arquivo laudo) {
        banco.executar("jpetstore.fn_adicionar_laudo_arquivo(?, ?, ?, ?)",
                animalId, laudo.nomeSemExtensao(), laudo.nome(), laudo.conteudo());
    }

    public void removerImagem(UUID animalId, UUID imagemId) {
        if (banco.alterar("delete from jpetstore.imagem_animal where id = ? and animal_id = ?", imagemId, animalId) == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "IMAGEM_NAO_ENCONTRADA", "Imagem não encontrada.");
        }
    }

    public void removerLaudo(UUID animalId, UUID laudoId) {
        if (banco.alterar("delete from jpetstore.laudo where id = ? and animal_id = ?", laudoId, animalId) == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "LAUDO_NAO_ENCONTRADO", "Laudo não encontrado.");
        }
    }

    public Optional<Arquivo> obterImagem(UUID imagemId) {
        return obter("jpetstore.fn_obter_arquivo_imagem(?)", imagemId);
    }

    public Optional<Arquivo> obterLaudo(UUID laudoId) {
        return obter("jpetstore.fn_obter_arquivo_laudo(?)", laudoId);
    }

    private Optional<Arquivo> obter(String funcao, UUID id) {
        return banco.linhas(funcao, LINHA, id).stream().findFirst();
    }
}
