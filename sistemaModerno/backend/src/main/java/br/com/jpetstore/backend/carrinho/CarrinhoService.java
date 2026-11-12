package br.com.jpetstore.backend.carrinho;

import br.com.jpetstore.backend.carrinho.dto.CarrinhoResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CarrinhoService {

    private final CarrinhoRepository repository;

    public CarrinhoService(CarrinhoRepository repository) {
        this.repository = repository;
    }

    /** RF08 — Visualizar Carrinho. */
    public CarrinhoResponse obter(UUID usuarioId) {
        return repository.obter(usuarioId);
    }

    /** RF09 — adicionar animal (idempotente; animal indisponível é recusado). */
    public CarrinhoResponse adicionar(UUID usuarioId, UUID animalId) {
        return repository.adicionar(usuarioId, animalId);
    }

    /** RF09 — remover animal. */
    public CarrinhoResponse remover(UUID usuarioId, UUID animalId) {
        return repository.remover(usuarioId, animalId);
    }

    /** RF09 — esvaziar carrinho. */
    public CarrinhoResponse limpar(UUID usuarioId) {
        return repository.limpar(usuarioId);
    }
}
