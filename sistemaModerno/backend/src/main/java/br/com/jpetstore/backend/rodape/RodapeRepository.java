package br.com.jpetstore.backend.rodape;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.rodape.dto.RodapeResponse;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class RodapeRepository {
    private final FuncoesBanco banco;

    public RodapeRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public RodapeResponse obter(UUID usuarioId) {
        return banco.json("jpetstore.fn_obter_rodape(?)", RodapeResponse.class, usuarioId);
    }

    public RodapeResponse habilitar(UUID usuarioId) {
        return banco.json("jpetstore.fn_habilitar_rodape(?)", RodapeResponse.class, usuarioId);
    }

    public RodapeResponse desabilitar(UUID usuarioId) {
        return banco.json("jpetstore.fn_desabilitar_rodape(?)", RodapeResponse.class, usuarioId);
    }

    public RodapeResponse personalizar(UUID usuarioId, String conteudoHtml) {
        return banco.json("jpetstore.fn_personalizar_rodape(?, ?)", RodapeResponse.class, usuarioId, conteudoHtml);
    }
}
