package br.com.jpetstore.backend.carrinho;

import br.com.jpetstore.backend.carrinho.dto.CarrinhoResponse;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class CarrinhoRepository {

    private final FuncoesBanco banco;

    public CarrinhoRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public CarrinhoResponse obter(UUID usuarioId) {
        return banco.json("jpetstore.fn_obter_carrinho(?)", CarrinhoResponse.class, usuarioId);
    }

    public CarrinhoResponse adicionar(UUID usuarioId, UUID animalId) {
        return banco.json("jpetstore.fn_adicionar_item_carrinho(?, ?)", CarrinhoResponse.class, usuarioId, animalId);
    }

    public CarrinhoResponse remover(UUID usuarioId, UUID animalId) {
        return banco.json("jpetstore.fn_remover_item_carrinho(?, ?)", CarrinhoResponse.class, usuarioId, animalId);
    }

    public CarrinhoResponse limpar(UUID usuarioId) {
        return banco.json("jpetstore.fn_limpar_carrinho(?)", CarrinhoResponse.class, usuarioId);
    }
}
