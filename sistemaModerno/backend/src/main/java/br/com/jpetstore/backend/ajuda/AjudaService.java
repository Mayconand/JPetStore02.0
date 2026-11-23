package br.com.jpetstore.backend.ajuda;

import br.com.jpetstore.backend.ajuda.dto.TopicoAjuda;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AjudaService {

    private final AjudaRepository repository;

    public AjudaService(AjudaRepository repository) {
        this.repository = repository;
    }

    public List<TopicoAjuda> listar(String termo) {
        return repository.listar(termo);
    }
}
