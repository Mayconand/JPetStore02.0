package br.com.jpetstore.backend.rodape;

import br.com.jpetstore.backend.rodape.dto.RodapeResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RodapeService {
    private final RodapeRepository repository;

    public RodapeService(RodapeRepository repository) {
        this.repository = repository;
    }

    public RodapeResponse obter(UUID usuarioId) {
        return repository.obter(usuarioId);
    }

    public RodapeResponse habilitar(UUID usuarioId) {
        return repository.habilitar(usuarioId);
    }

    public RodapeResponse desabilitar(UUID usuarioId) {
        return repository.desabilitar(usuarioId);
    }

    public RodapeResponse personalizar(UUID usuarioId, String conteudoHtml) {
        return repository.personalizar(usuarioId, conteudoHtml);
    }
}
