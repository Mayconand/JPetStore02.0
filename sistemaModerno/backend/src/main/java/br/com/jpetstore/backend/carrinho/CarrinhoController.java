package br.com.jpetstore.backend.carrinho;

import br.com.jpetstore.backend.carrinho.dto.AdicionarItemRequest;
import br.com.jpetstore.backend.carrinho.dto.CarrinhoResponse;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    private final CarrinhoService service;

    public CarrinhoController(CarrinhoService service) {
        this.service = service;
    }

    /** RF08 — Visualizar Carrinho. */
    @GetMapping
    public CarrinhoResponse obter(@AuthenticationPrincipal Jwt jwt) {
        return service.obter(UsuarioAutenticado.id(jwt));
    }

    /** RF09 — Atualizar Carrinho: adicionar. */
    @PostMapping("/itens")
    public CarrinhoResponse adicionar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AdicionarItemRequest request) {
        return service.adicionar(UsuarioAutenticado.id(jwt), request.animalId());
    }

    /** RF09 — Atualizar Carrinho: remover. */
    @DeleteMapping("/itens/{animalId}")
    public CarrinhoResponse remover(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID animalId) {
        return service.remover(UsuarioAutenticado.id(jwt), animalId);
    }

    /** RF09 — Atualizar Carrinho: esvaziar. */
    @DeleteMapping
    public CarrinhoResponse limpar(@AuthenticationPrincipal Jwt jwt) {
        return service.limpar(UsuarioAutenticado.id(jwt));
    }
}
