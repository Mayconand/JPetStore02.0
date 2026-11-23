package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.pedido.dto.FiltroPedidos;
import br.com.jpetstore.backend.pedido.dto.PedidoAdminResumo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PedidoAdminService {

    private final PedidoAdminRepository repository;
    private final AdminService admins;

    public PedidoAdminService(PedidoAdminRepository repository, AdminService admins) {
        this.repository = repository;
        this.admins = admins;
    }

    public List<PedidoAdminResumo> filtrar(UUID usuarioId, FiltroPedidos filtro) {
        admins.verificarAcesso(usuarioId);
        if (filtro.inicio() != null && filtro.fim() != null && filtro.inicio().isAfter(filtro.fim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PERIODO_INVALIDO",
                    "A data inicial não pode ser posterior à data final.");
        }
        return repository.filtrar(filtro);
    }
}
