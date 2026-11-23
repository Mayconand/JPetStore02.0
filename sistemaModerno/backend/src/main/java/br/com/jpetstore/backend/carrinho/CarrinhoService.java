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

    /** RF29 — aplicar cupom. */
    public CarrinhoResponse aplicarCupom(UUID usuarioId, String codigo) {
        return repository.aplicarCupom(usuarioId, codigo);
    }

    /** RF29 — remover cupom. */
    public CarrinhoResponse removerCupom(UUID usuarioId) {
        return repository.removerCupom(usuarioId);
    }

    /** RF09 — esvaziar carrinho. */
    public CarrinhoResponse limpar(UUID usuarioId) {
        return repository.limpar(usuarioId);
    }
}
