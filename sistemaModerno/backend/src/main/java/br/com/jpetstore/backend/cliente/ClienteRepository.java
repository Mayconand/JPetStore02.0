package br.com.jpetstore.backend.cliente;

import br.com.jpetstore.backend.cliente.dto.ClienteResumo;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class ClienteRepository {

    private final FuncoesBanco banco;

    public ClienteRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public List<ClienteResumo> listar() {
        return banco.linhas("jpetstore.fn_listar_clientes()", (rs, linha) -> new ClienteResumo(
                rs.getObject("id", UUID.class),
                rs.getString("nome"),
                rs.getString("sobrenome"),
                rs.getString("email"),
                rs.getString("telefone"),
                rs.getLong("quantidade_pedidos"),
                rs.getBigDecimal("valor_total_gasto"),
                rs.getObject("ultimo_pedido", OffsetDateTime.class)));
    }
}
