package br.com.jpetstore.backend.rodape;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.rodape.dto.RodapeResponse;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RodapeService {
    private final RodapeRepository repository;
    private final AdminService admins;

    public RodapeService(RodapeRepository repository, AdminService admins) {
        this.repository = repository;
        this.admins = admins;
    }

    public RodapeResponse obter() {
        return repository.obter();
    }

    public RodapeResponse habilitar(UUID usuarioId) {
        admins.verificarAcesso(usuarioId);
        return repository.habilitar();
    }

    public RodapeResponse desabilitar(UUID usuarioId) {
        admins.verificarAcesso(usuarioId);
        return repository.desabilitar();
    }

    public RodapeResponse personalizar(UUID usuarioId, String conteudoHtml) {
        admins.verificarAcesso(usuarioId);
        return repository.personalizar(conteudoHtml);
    }
}
