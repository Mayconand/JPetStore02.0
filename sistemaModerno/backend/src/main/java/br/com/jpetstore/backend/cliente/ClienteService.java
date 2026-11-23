package br.com.jpetstore.backend.cliente;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.cliente.dto.ClienteResumo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final AdminService admins;

    public ClienteService(ClienteRepository repository, AdminService admins) {
        this.repository = repository;
        this.admins = admins;
    }

    public List<ClienteResumo> listar(UUID usuarioId) {
        admins.verificarAcesso(usuarioId);
        return repository.listar();
    }
}
