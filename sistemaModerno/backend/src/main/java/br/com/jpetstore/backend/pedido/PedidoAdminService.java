package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.pedido.dto.FiltroPedidos;
import br.com.jpetstore.backend.pedido.dto.PedidoAdminResumo;
import org.springframework.http.HttpStatus;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;
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

    public void alterarStatus(UUID usuarioId, UUID pedidoId, StatusPedidoEnum status) {
        admins.verificarAcesso(usuarioId);
        if (status != StatusPedidoEnum.ENVIADO && status != StatusPedidoEnum.ENTREGUE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "STATUS_INVALIDO", "Escolha Enviado ou Entregue.");
        }
        repository.alterarStatus(pedidoId, status);
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
