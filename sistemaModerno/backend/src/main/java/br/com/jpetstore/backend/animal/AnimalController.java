package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.dto.AnimalResumo;
import br.com.jpetstore.backend.animal.dto.AnimalResponse;
import br.com.jpetstore.backend.animal.dto.TagResponse;
import br.com.jpetstore.backend.animal.dto.BuscaAnimaisFiltro;
import br.com.jpetstore.backend.comum.Pagina;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {

    private final AnimalService service;

    public AnimalController(AnimalService service) {
        this.service = service;
    }

    /** RF16 — Visualizar a ficha de um animal selecionado. */
    @GetMapping("/{id}")
    public AnimalResponse obter(@PathVariable UUID id) {
        return service.obter(id);
    }

    /** RF17 — Buscar tags por nome, sem diferenciar acentos. */
    @GetMapping("/tags")
    public List<TagResponse> buscarTags(@RequestParam(required = false) String termo) {
        return service.buscarTags(termo);
    }

    /** RF07 — Buscar Animais (rota pública). */
    @GetMapping
    public Pagina<AnimalResumo> buscar(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) UUID racaId,
            @RequestParam(required = false) String raca,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return service.buscar(new BuscaAnimaisFiltro(termo, especie, racaId, raca, precoMin, precoMax), page, size);
    }
}
