package br.com.jpetstore.backend.raca;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.raca.dto.CadastrarRacaRequest;
import br.com.jpetstore.backend.raca.dto.EditarRacaRequest;
import br.com.jpetstore.backend.raca.dto.RacaResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RacaService {

    private final RacaRepository repository;
    private final AdminService admins;

    public RacaService(RacaRepository repository, AdminService admins) {
        this.repository = repository;
        this.admins = admins;
    }

    public List<RacaResponse> listar(UUID usuarioId, String especie, String termo) {
        admins.verificarAcesso(usuarioId);
        return repository.listar(especie, termo);
    }

    /** Nomes das raças para os filtros do cliente (rota pública). */
    public List<String> listarNomes(String especie) {
        return repository.listar(especie, null).stream().map(RacaResponse::nome).toList();
    }

    public RacaResponse obter(UUID usuarioId, UUID id) {
        admins.verificarAcesso(usuarioId);
        return repository.obter(id);
    }

    public RacaResponse cadastrar(UUID usuarioId, CadastrarRacaRequest dados) {
        admins.verificarAcesso(usuarioId);
        return repository.obter(repository.cadastrar(dados));
    }

    public RacaResponse editar(UUID usuarioId, UUID id, EditarRacaRequest dados) {
        admins.verificarAcesso(usuarioId);
        repository.editar(id, dados);
        return repository.obter(id);
    }

    public void excluir(UUID usuarioId, UUID id) {
        admins.verificarAcesso(usuarioId);
        repository.excluir(id);
    }
}
