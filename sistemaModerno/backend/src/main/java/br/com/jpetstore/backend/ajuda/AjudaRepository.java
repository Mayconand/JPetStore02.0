package br.com.jpetstore.backend.ajuda;

import br.com.jpetstore.backend.ajuda.dto.TopicoAjuda;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class AjudaRepository {

    private final FuncoesBanco banco;

    public AjudaRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public List<TopicoAjuda> listar(String termo) {
        return banco.linhas("jpetstore.fn_listar_ajuda(?)",
                (rs, linha) -> new TopicoAjuda(rs.getObject("id", UUID.class), rs.getString("titulo"), rs.getString("conteudo")),
                termo);
    }
}
