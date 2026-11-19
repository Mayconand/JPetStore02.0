package br.com.jpetstore.backend.rodape;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.rodape.dto.RodapeResponse;
import org.springframework.stereotype.Repository;

@Repository
public class RodapeRepository {
    private final FuncoesBanco banco;

    public RodapeRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public RodapeResponse obter() {
        return banco.json("jpetstore.fn_obter_rodape()", RodapeResponse.class);
    }

    public RodapeResponse habilitar() {
        return banco.json("jpetstore.fn_habilitar_rodape()", RodapeResponse.class);
    }

    public RodapeResponse desabilitar() {
        return banco.json("jpetstore.fn_desabilitar_rodape()", RodapeResponse.class);
    }

    public RodapeResponse personalizar(String conteudoHtml) {
        return banco.json("jpetstore.fn_personalizar_rodape(?)", RodapeResponse.class, conteudoHtml);
    }
}
