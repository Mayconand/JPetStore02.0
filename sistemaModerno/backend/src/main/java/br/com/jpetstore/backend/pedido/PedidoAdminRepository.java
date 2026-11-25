package br.com.jpetstore.backend.pedido;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.ModalidadeEntregaEnum;
import br.com.jpetstore.backend.enums.StatusPedidoEnum;
import br.com.jpetstore.backend.pedido.dto.FiltroPedidos;
import br.com.jpetstore.backend.pedido.dto.PedidoAdminResumo;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class PedidoAdminRepository {

    /** A função do banco não traz os nomes dos animais; eles são acrescentados aqui. */
    private static final String PEDIDOS = """
            (select f.id, f.usuario_id, f.cliente, f.email, f.data_criacao, f.status, f.modalidade,
                    f.valor_total, f.quantidade_itens,
                    (select string_agg(i.nome_animal, ', ' order by i.nome_animal)
                       from jpetstore.item_pedido i where i.pedido_id = f.id) as nomes_dos_animais
               from jpetstore.fn_filtrar_pedidos(?::jpetstore.status_pedido, ?::date, ?::date, ?::uuid) f) pedidos
            order by data_criacao desc
            """;

    private final FuncoesBanco banco;

    public PedidoAdminRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public List<PedidoAdminResumo> filtrar(FiltroPedidos filtro) {
        return banco.linhas(PEDIDOS,
                (rs, linha) -> new PedidoAdminResumo(
                        rs.getObject("id", UUID.class),
                        rs.getObject("usuario_id", UUID.class),
                        rs.getString("cliente"),
                        rs.getString("email"),
                        rs.getObject("data_criacao", OffsetDateTime.class),
                        StatusPedidoEnum.valueOf(rs.getString("status")),
                        ModalidadeEntregaEnum.valueOf(rs.getString("modalidade")),
                        rs.getBigDecimal("valor_total"),
                        rs.getInt("quantidade_itens"),
                        rs.getString("nomes_dos_animais")),
                filtro.status() != null ? filtro.status().name() : null,
                filtro.inicio(), filtro.fim(), filtro.clienteId());
    }
    public void alterarStatus(UUID id, StatusPedidoEnum status) {
        banco.executar("jpetstore.fn_avancar_pedido(?, ?::jpetstore.status_pedido)", id, status.name());
    }
}
