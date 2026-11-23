package br.com.jpetstore.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** RF21 (endereço alternativo), RF22 (ajuda), RF25 (clientes), RF29 (cupom) e RF30 (filtrar pedidos). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(BancoDeTesteConfig.class)
class LojaAdminIntegracaoTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    JsonMapper json;
    @Autowired
    JdbcTemplate jdbc;

    String admin;

    @BeforeEach
    void entrarComoAdmin() throws Exception {
        admin = login("admin@jpetstore.com", "Admin@123");
    }

    // ------------------------------------------------------------------ helpers

    record Cliente(UUID id, String email, String token) {
    }

    JsonNode corpo(ResultActions resultado) throws Exception {
        return json.readTree(resultado.andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    ResultActions enviar(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        }
        return mvc.perform(req);
    }

    JsonNode ok(MockHttpServletRequestBuilder req, String token, Object body) throws Exception {
        return corpo(enviar(req, token, body).andExpect(status().isOk()));
    }

    void erro(ResultActions resultado, int status, String codigo) throws Exception {
        JsonNode corpo = corpo(resultado.andExpect(status().is(status)));
        assertThat(corpo.get("codigo").asString()).isEqualTo(codigo);
        assertThat(corpo.get("mensagem").asString()).isNotBlank();
    }

    void somenteAdmin(MockHttpServletRequestBuilder semLogin, MockHttpServletRequestBuilder comoCliente) throws Exception {
        enviar(semLogin, null, null).andExpect(status().isUnauthorized());
        enviar(comoCliente, novoCliente().token(), null).andExpect(status().isForbidden());
    }

    String login(String email, String senha) throws Exception {
        return ok(post("/api/auth/login"), null, Map.of("email", email, "senha", senha)).get("token").asString();
    }

    Map<String, Object> endereco(String rua, String numero) {
        var endereco = new HashMap<String, Object>();
        endereco.put("rua", rua);
        endereco.put("numero", numero);
        endereco.put("bairro", "Centro");
        endereco.put("cidade", "Salvador");
        endereco.put("estado", "BA");
        endereco.put("cep", "41480-225");
        return endereco;
    }

    Cliente novoCliente() throws Exception {
        String email = "loja-" + UUID.randomUUID() + "@exemplo.com";
        JsonNode perfil = corpo(enviar(post("/api/usuarios"), null, Map.of(
                "nome", "Bia", "sobrenome", "Lima", "email", email, "senha", "SenhaForte1",
                "enderecos", List.of(endereco("Rua Principal", "1")))).andExpect(status().isCreated()));
        return new Cliente(UUID.fromString(perfil.get("id").asString()), email, login(email, "SenhaForte1"));
    }

    UUID novoAnimal(String nome, String preco) {
        return jdbc.queryForObject("""
                select jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
                    'racaId', (select id from jpetstore.raca where nome = 'Bulldog'), 'nome', ?, 'preco', ?::numeric))
                """, UUID.class, nome, preco);
    }

    void adicionarAoCarrinho(Cliente cliente, String nome, String preco) throws Exception {
        ok(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", novoAnimal(nome, preco)));
    }

    String novoPedido(Cliente cliente, String nomeDoAnimal, String preco) throws Exception {
        adicionarAoCarrinho(cliente, nomeDoAnimal, preco);
        return corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "RETIRADA"))
                .andExpect(status().isCreated())).get("id").asString();
    }

    /** O cupom é inserido direto no banco: não há rota de cadastro. */
    String novoCupom(int percentual) {
        String codigo = "T" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        jdbc.queryForObject("select jpetstore.fn_inserir_cupom(?, ?, current_date + 10)", UUID.class, codigo, percentual);
        return codigo;
    }

    List<String> ids(JsonNode lista) {
        return lista.valueStream().map(item -> item.get("id").asString()).toList();
    }

    // ------------------------------------------------------------------ RF21

    @Nested
    class EnderecoAlternativo {

        @Test
        void cadastrarOutroEnderecoNaoTrocaOPrincipal() throws Exception {
            Cliente cliente = novoCliente();

            String id = corpo(enviar(post("/api/usuarios/me/enderecos"), cliente.token(), endereco("Rua Alternativa", "2"))
                    .andExpect(status().isCreated())).get("id").asString();

            JsonNode enderecos = ok(get("/api/usuarios/me/enderecos"), cliente.token(), null);
            assertThat(enderecos).hasSize(2);
            assertThat(enderecos.get(0).get("rua").asString()).isEqualTo("Rua Principal");
            assertThat(enderecos.get(0).get("principal").asBoolean()).isTrue();
            assertThat(enderecos.get(1).get("id").asString()).isEqualTo(id);
            assertThat(enderecos.get(1).get("principal").asBoolean()).isFalse();
        }

        @Test
        void enderecoAlternativoPodeReceberAEntrega() throws Exception {
            Cliente cliente = novoCliente();
            String id = corpo(enviar(post("/api/usuarios/me/enderecos"), cliente.token(), endereco("Rua Alternativa", "2")))
                    .get("id").asString();
            adicionarAoCarrinho(cliente, "Rex", "100");

            JsonNode pedido = corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "ENTREGA", "enderecoId", id))
                    .andExpect(status().isCreated()));

            assertThat(pedido.get("enderecoEntrega").get("rua").asString()).isEqualTo("Rua Alternativa");
        }

        @Test
        void editaSomenteOProprioEndereco() throws Exception {
            Cliente cliente = novoCliente();
            String id = ok(get("/api/usuarios/me/enderecos"), cliente.token(), null).get(0).get("id").asString();

            JsonNode editado = ok(put("/api/usuarios/me/enderecos/" + id), cliente.token(), endereco("Rua Corrigida", "9"));
            assertThat(editado.get("rua").asString()).isEqualTo("Rua Corrigida");
            assertThat(editado.get("principal").asBoolean()).isTrue();

            erro(enviar(put("/api/usuarios/me/enderecos/" + id), novoCliente().token(), endereco("Rua X", "9")), 404, "ENDERECO_NAO_ENCONTRADO");
            erro(enviar(put("/api/usuarios/me/enderecos/" + id), cliente.token(), endereco("Rua X", null)), 422, "ENDERECO_INCOMPLETO");
            enviar(put("/api/usuarios/me/enderecos/" + id), null, endereco("Rua X", "9")).andExpect(status().isUnauthorized());
        }
    }

    // ------------------------------------------------------------------ RF22

    @Nested
    class Ajuda {

        @Test
        void listaSemLoginEBuscaSemAcentos() throws Exception {
            assertThat(ok(get("/api/ajuda"), null, null)).hasSizeGreaterThanOrEqualTo(4);

            JsonNode busca = ok(get("/api/ajuda").param("termo", "ENDERECO"), null, null);
            assertThat(busca.valueStream().map(t -> t.get("titulo").asString())).contains("Como cadastrar outro endereço?");

            assertThat(ok(get("/api/ajuda").param("termo", "nada-disso-existe"), null, null)).isEmpty();
        }
    }

    // ------------------------------------------------------------------ RF25

    @Nested
    class Clientes {

        @Test
        void listaQuemComprouSemContarCancelados() throws Exception {
            Cliente comprou = novoCliente();
            Cliente naoComprou = novoCliente();
            novoPedido(comprou, "Rex", "300");
            String cancelado = novoPedido(comprou, "Bob", "50");
            ok(post("/api/pedidos/" + cancelado + "/cancelar"), comprou.token(), null);

            JsonNode clientes = ok(get("/api/admin/clientes"), admin, null);

            JsonNode linha = clientes.valueStream()
                    .filter(c -> c.get("id").asString().equals(comprou.id().toString())).findFirst().orElseThrow();
            assertThat(linha.get("nome").asString()).isEqualTo("Bia");
            assertThat(linha.get("email").asString()).isEqualTo(comprou.email());
            assertThat(linha.get("quantidadePedidos").asInt()).isEqualTo(1);
            assertThat(linha.get("valorTotalGasto").decimalValue()).isEqualByComparingTo("300");
            assertThat(linha.get("ultimoPedido").asString()).isNotBlank();
            assertThat(ids(clientes)).doesNotContain(naoComprou.id().toString());
        }

        @Test
        void somenteAdministrador() throws Exception {
            somenteAdmin(get("/api/admin/clientes"), get("/api/admin/clientes"));
        }
    }

    // ------------------------------------------------------------------ RF29

    @Nested
    class Cupom {

        @Test
        void clienteAplicaERemove() throws Exception {
            String codigo = novoCupom(10);
            Cliente cliente = novoCliente();
            adicionarAoCarrinho(cliente, "Rex", "200");

            JsonNode comCupom = ok(put("/api/carrinho/cupom"), cliente.token(), Map.of("codigo", codigo.toLowerCase()));
            assertThat(comCupom.get("cupom").get("codigo").asString()).isEqualTo(codigo);
            assertThat(comCupom.get("desconto").decimalValue()).isEqualByComparingTo("20");
            assertThat(comCupom.get("total").decimalValue()).isEqualByComparingTo("180");

            JsonNode semCupom = ok(delete("/api/carrinho/cupom"), cliente.token(), null);
            assertThat(semCupom.get("cupom").isNull()).isTrue();
            assertThat(semCupom.get("total").decimalValue()).isEqualByComparingTo("200");
        }

        @Test
        void descontoVaiParaOPedido() throws Exception {
            Cliente cliente = novoCliente();
            adicionarAoCarrinho(cliente, "Rex", "200");
            ok(put("/api/carrinho/cupom"), cliente.token(), Map.of("codigo", novoCupom(25)));

            JsonNode pedido = corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "RETIRADA")));

            assertThat(pedido.get("valorDesconto").decimalValue()).isEqualByComparingTo("50");
            assertThat(pedido.get("valorTotal").decimalValue()).isEqualByComparingTo("150");
        }

        @Test
        void recusaCupomInvalidoOuVencido() throws Exception {
            Cliente cliente = novoCliente();
            String codigo = novoCupom(10);
            jdbc.update("update jpetstore.cupom set data_validade = current_date - 1 where codigo = ?", codigo);

            erro(enviar(put("/api/carrinho/cupom"), cliente.token(), Map.of("codigo", codigo)), 422, "CUPOM_INVALIDO");
            erro(enviar(put("/api/carrinho/cupom"), cliente.token(), Map.of("codigo", "NAO-EXISTE")), 422, "CUPOM_INVALIDO");
            erro(enviar(put("/api/carrinho/cupom"), cliente.token(), Map.of("codigo", " ")), 400, "DADOS_INVALIDOS");
            enviar(put("/api/carrinho/cupom"), null, Map.of("codigo", codigo)).andExpect(status().isUnauthorized());
        }
    }

    // ------------------------------------------------------------------ RF30

    @Nested
    class FiltrarPedidos {

        @Test
        void porClienteStatusEPeriodo() throws Exception {
            Cliente cliente = novoCliente();
            String aguardando = novoPedido(cliente, "Rex", "10");
            String pago = novoPedido(cliente, "Bob", "20");
            ok(post("/api/pedidos/" + pago + "/pagamento"), cliente.token(), Map.of("forma", "PIX"));
            jdbc.update("update jpetstore.pedido set data_criacao = timestamptz '2026-01-15 12:00' where id = ?::uuid", pago);
            String id = cliente.id().toString();

            assertThat(ids(ok(get("/api/admin/pedidos").param("clienteId", id), admin, null))).containsExactly(aguardando, pago);
            assertThat(ids(ok(get("/api/admin/pedidos").param("clienteId", id).param("status", "PAGO"), admin, null))).containsExactly(pago);
            assertThat(ids(ok(get("/api/admin/pedidos").param("clienteId", id)
                    .param("inicio", "2026-01-15").param("fim", "2026-01-15"), admin, null))).containsExactly(pago);
            assertThat(ids(ok(get("/api/admin/pedidos").param("clienteId", id).param("fim", "2026-01-14"), admin, null))).isEmpty();

            JsonNode linha = ok(get("/api/admin/pedidos").param("clienteId", id).param("status", "PAGO"), admin, null).get(0);
            assertThat(linha.get("cliente").asString()).isEqualTo("Bia Lima");
            assertThat(linha.get("animais").asString()).isEqualTo("Bob");
            assertThat(linha.get("valorTotal").decimalValue()).isEqualByComparingTo("20");
        }

        @Test
        void semFiltroTrazPedidosDeTodos() throws Exception {
            String a = novoPedido(novoCliente(), "Rex", "10");
            String b = novoPedido(novoCliente(), "Bob", "10");
            assertThat(ids(ok(get("/api/admin/pedidos"), admin, null))).contains(a, b);
        }

        @Test
        void recusaFiltrosInvalidos() throws Exception {
            erro(enviar(get("/api/admin/pedidos").param("status", "VOANDO"), admin, null), 400, "REQUISICAO_INVALIDA");
            erro(enviar(get("/api/admin/pedidos").param("inicio", "15/01/2026"), admin, null), 400, "REQUISICAO_INVALIDA");
            erro(enviar(get("/api/admin/pedidos").param("inicio", "2026-02-01").param("fim", "2026-01-01"), admin, null), 400, "PERIODO_INVALIDO");
        }

        @Test
        void somenteAdministrador() throws Exception {
            somenteAdmin(get("/api/admin/pedidos"), get("/api/admin/pedidos"));
        }
    }
}
