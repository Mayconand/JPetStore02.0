package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.dto.AnimalResumo;
import br.com.jpetstore.backend.animal.dto.BuscaAnimaisFiltro;
import br.com.jpetstore.backend.comum.Pagina;
import org.springframework.stereotype.Service;

@Service
public class AnimalService {

    static final int TAMANHO_MAXIMO = 50;

    private final AnimalRepository repository;

    public AnimalService(AnimalRepository repository) {
        this.repository = repository;
    }

    /** RF07 — Buscar Animais. Página começa em 0. */
    public Pagina<AnimalResumo> buscar(BuscaAnimaisFiltro filtro, int pagina, int tamanho) {
        int paginaValida = Math.max(pagina, 0);
        int tamanhoValido = Math.clamp(tamanho, 1, TAMANHO_MAXIMO);
        AnimalRepository.ResultadoBusca resultado = repository.buscar(filtro, tamanhoValido, paginaValida * tamanhoValido);
        // Quando a página pedida está além do fim, o banco não devolve linhas (e nem o total).
        long total = resultado.animais().isEmpty() && paginaValida > 0
                ? repository.buscar(filtro, 1, 0).total()
                : resultado.total();
        int totalPaginas = (int) Math.ceil((double) total / tamanhoValido);
        return new Pagina<>(resultado.animais(), paginaValida, tamanhoValido, total, totalPaginas);
    }
}
