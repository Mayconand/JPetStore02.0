package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.dto.AnimalResumo;
import br.com.jpetstore.backend.animal.dto.AnimalResponse;
import br.com.jpetstore.backend.animal.dto.TagResponse;
import br.com.jpetstore.backend.animal.dto.BuscaAnimaisFiltro;
import br.com.jpetstore.backend.comum.Pagina;
import br.com.jpetstore.backend.raca.RacaService;
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
    private final RacaService racas;

    public AnimalController(AnimalService service, RacaService racas) {
        this.service = service;
        this.racas = racas;
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

    /** Raças cadastradas, para os filtros do cliente (rota pública). */
    @GetMapping("/racas")
    public List<String> listarRacas(@RequestParam(required = false) String especie) {
        return racas.listarNomes(especie);
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
