package br.com.jpetstore.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Reserva de Animais sob concorrência: um Animal é um indivíduo único, então
 * só um Pedido pode levá-lo, e quem perde a disputa recebe ANIMAL_INDISPONIVEL
 * (nunca um Pedido incompleto nem erro interno).
 */
class ConcorrenciaReservaTest extends FuncoesBancoTestBase {

    @Autowired
    DataSource dataSource;

    /** Abre uma transação e cria o Pedido do usuário SEM fazer commit (mantém as travas). */
    Connection criarPedidoSemCommit(UUID usuario) throws Exception {
        Connection conexao = dataSource.getConnection();
        conexao.setAutoCommit(false);
        try (PreparedStatement st = conexao.prepareStatement("select jpetstore.fn_criar_pedido(?, 'RETIRADA')")) {
            st.setObject(1, usuario);
            st.executeQuery().close();
        }
        return conexao;
    }

    @Test
    void quemPerdeADisputaPeloAnimalRecebeAnimalIndisponivelSemPedidoParcial() throws Exception {
        UUID disputado = novoAnimal("500.00");
        UUID outroAnimal = novoAnimal("80.00");
        UUID vencedor = novoUsuario();
        UUID perdedor = novoUsuario();
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", vencedor, disputado);
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", perdedor, disputado);
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", perdedor, outroAnimal);

        try (Connection transacaoVencedor = criarPedidoSemCommit(vencedor)) {
            // O perdedor finaliza enquanto o vencedor ainda segura a reserva.
            CompletableFuture<Void> perdedorFinaliza = CompletableFuture.runAsync(() -> deveFalhar(
                    "JP409", "ANIMAL_INDISPONIVEL",
                    () -> valor("jpetstore.fn_criar_pedido(?, 'RETIRADA')", UUID.class, perdedor)));
            Thread.sleep(500);
            transacaoVencedor.commit();
            perdedorFinaliza.get(20, TimeUnit.SECONDS);
        }

        // Nenhum Pedido parcial para o perdedor; o outro Animal continua disponível.
        assertThat(jsonDe("jpetstore.fn_listar_pedidos_usuario(?)", perdedor)).isEmpty();
        assertThat(jsonDe("jpetstore.fn_obter_animal(?)", outroAnimal).get("disponivel").asBoolean()).isTrue();
    }

    @Test
    void naoEPossivelColocarNoCarrinhoUmAnimalQueEstaSendoVendido() throws Exception {
        UUID animal = novoAnimal("300.00");
        UUID comprador = novoUsuario();
        UUID interessado = novoUsuario();
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", comprador, animal);

        try (Connection transacaoComprador = criarPedidoSemCommit(comprador)) {
            CompletableFuture<Void> interessadoAdiciona = CompletableFuture.runAsync(() -> deveFalhar(
                    "JP422", "ANIMAL_INDISPONIVEL",
                    () -> executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", interessado, animal)));
            Thread.sleep(500);
            transacaoComprador.commit();
            interessadoAdiciona.get(20, TimeUnit.SECONDS);
        }

        assertThat(jsonDe("jpetstore.fn_obter_carrinho(?)", interessado).get("itens")).isEmpty();
    }

    @Test
    void administradorNaoPodeLiberarUmAnimalReservadoPorUmPedido() {
        UUID usuario = novoUsuario();
        UUID animal = novoAnimal("100.00");
        executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", usuario, animal);
        UUID pedido = valor("jpetstore.fn_criar_pedido(?, 'RETIRADA')", UUID.class, usuario);

        deveFalhar("JP409", "ANIMAL_RESERVADO",
                () -> executar("jpetstore.fn_editar_animal(?, '{\"disponivel\": true}'::jsonb)", animal));

        // Depois do cancelamento o Animal volta a ficar disponível e pode ser editado livremente.
        executar("jpetstore.fn_cancelar_pedido(?, ?)", usuario, pedido);
        executar("jpetstore.fn_editar_animal(?, '{\"disponivel\": false}'::jsonb)", animal);
        executar("jpetstore.fn_editar_animal(?, '{\"disponivel\": true}'::jsonb)", animal);
        assertThat(jsonDe("jpetstore.fn_obter_animal(?)", animal).get("disponivel").asBoolean()).isTrue();
    }
}
