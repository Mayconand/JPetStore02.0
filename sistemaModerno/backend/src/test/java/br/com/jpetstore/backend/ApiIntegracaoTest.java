package br.com.jpetstore.backend;

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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes ponta a ponta da API (backend + funções de banco) contra um Postgres
 * temporário com as migrations do Supabase. Cobre os requisitos do quadro
 * "Yasmin - BackEnd": RF02–RF10, RNF05, criar e cancelar pedido.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfig.class)
class ApiIntegracaoTest {

    static final String ADMIN_EMAIL = "admin@jpetstore.com";
    static final String ADMIN_SENHA = "Admin@123";

    @Autowired
    MockMvc mvc;

    @Autowired
    JsonMapper json;

    @Autowired
    JdbcTemplate jdbc;

    // ------------------------------------------------------------------ helpers

    JsonNode corpo(ResultActions resultado) throws Exception {
        String texto = resultado.andReturn().getResponse().getContentAsString();
        return texto.isBlank() ? null : json.readTree(texto);
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

    String emailNovo() {
        return "teste-" + UUID.randomUUID() + "@exemplo.com";
    }

    Map<String, Object> endereco(String rua, String numero) {
        var e = new java.util.HashMap<String, Object>();
        e.put("rua", rua);
        e.put("numero", numero);
        e.put("bairro", "Centro");
        e.put("cidade", "São Paulo");
        e.put("estado", "SP");
        e.put("cep", "01001-000");
        return e;
    }

    JsonNode cadastrar(String email, List<Map<String, Object>> enderecos) throws Exception {
        var body = Map.of(
                "nome", "Ana", "sobrenome", "Souza", "email", email, "telefone", "11999999999",
                "senha", "SenhaForte1", "idiomaPreferencial", "pt-BR",
                "preferencias", Map.of("categoriaFavorita", "dogs"),
                "enderecos", enderecos);
        return corpo(enviar(post("/api/usuarios"), null, body).andExpect(status().isCreated()));
    }

    String login(String email, String senha) throws Exception {
        JsonNode resposta = corpo(enviar(post("/api/auth/login"), null, Map.of("email", email, "senha", senha))
                .andExpect(status().isOk()));
        return resposta.get("token").asString();
    }

    /** Cliente novo, com um endereço completo, já logado. */
    record Cliente(String token, UUID enderecoId) {
    }

    Cliente novoCliente() throws Exception {
        String email = emailNovo();
        JsonNode perfil = cadastrar(email, List.of(endereco("Rua A", "10")));
        return new Cliente(login(email, "SenhaForte1"), UUID.fromString(perfil.get("enderecos").get(0).get("id").asString()));
    }

    /** Cria um animal exclusivo para o teste (o estoque é compartilhado entre testes). */
    UUID novoAnimal(String nome, String preco) {
        return jdbc.queryForObject("""
                select jpetstore.fn_cadastrar_animal('CACHORRO', jsonb_build_object(
                    'racaId', (select id from jpetstore.raca where nome = 'Bulldog'),
                    'nome', ?, 'preco', ?::numeric, 'porte', 'MEDIO', 'tags', jsonb_build_array('Teste')))
                """, UUID.class, nome, preco);
    }

    List<String> idsDaBusca(String termo) throws Exception {
        JsonNode pagina = corpo(enviar(get("/api/animais").param("termo", termo).param("size", "50"), null, null)
                .andExpect(status().isOk()));
        List<String> ids = new ArrayList<>();
        pagina.get("conteudo").forEach(a -> ids.add(a.get("id").asString()));
        return ids;
    }

    // ------------------------------------------------------------------ RF02 / RF03 / RF10

    @Nested
    class Autenticacao {

        @Test
        void cadastroGravaEnderecosComPrimeiroComoPrincipalELoginFunciona() throws Exception {
            String email = emailNovo();
            JsonNode perfil = cadastrar(email, List.of(endereco("Rua A", "10"), endereco("Rua B", "20")));

            assertThat(perfil.get("papel").asString()).isEqualTo("CLIENTE");
            assertThat(perfil.get("enderecos")).hasSize(2);
            assertThat(perfil.get("enderecos").get(0).get("principal").asBoolean()).isTrue();
            assertThat(perfil.get("enderecos").get(1).get("principal").asBoolean()).isFalse();
            assertThat(perfil.get("enderecos").get(0).get("cep").asString()).isEqualTo("01001000");

            assertThat(login(email.toUpperCase(), "SenhaForte1")).isNotBlank();
        }

        @Test
        void emailDuplicadoRetorna409() throws Exception {
            String email = emailNovo();
            cadastrar(email, List.of());
            var body = Map.of("nome", "X", "sobrenome", "Y", "email", email, "senha", "SenhaForte1");
            JsonNode erro = corpo(enviar(post("/api/usuarios"), null, body).andExpect(status().isConflict()));
            assertThat(erro.get("codigo").asString()).isEqualTo("EMAIL_JA_CADASTRADO");
        }

        @Test
        void cadastroInvalidoRetorna400ComCampos() throws Exception {
            var body = Map.of("nome", "", "sobrenome", "Y", "email", "nao-e-email", "senha", "curta");
            JsonNode erro = corpo(enviar(post("/api/usuarios"), null, body).andExpect(status().isBadRequest()));
            assertThat(erro.get("campos").has("email")).isTrue();
            assertThat(erro.get("campos").has("senha")).isTrue();
            assertThat(erro.get("campos").has("nome")).isTrue();
        }

        @Test
        void senhaErradaRetorna401() throws Exception {
            String email = emailNovo();
            cadastrar(email, List.of());
            JsonNode erro = corpo(enviar(post("/api/auth/login"), null, Map.of("email", email, "senha", "errada123"))
                    .andExpect(status().isUnauthorized()));
            assertThat(erro.get("codigo").asString()).isEqualTo("CREDENCIAIS_INVALIDAS");
        }

        @Test
        void logoutInvalidaOToken() throws Exception {
            Cliente cliente = novoCliente();
            enviar(get("/api/usuarios/me"), cliente.token(), null).andExpect(status().isOk());

            enviar(post("/api/auth/logout"), cliente.token(), null).andExpect(status().isNoContent());

            enviar(get("/api/usuarios/me"), cliente.token(), null).andExpect(status().isUnauthorized());
        }
    }

    // ------------------------------------------------------------------ RF04 / RF05

    @Nested
    class Perfil {

        @Test
        void visualizarEAlterarPerfil() throws Exception {
            Cliente cliente = novoCliente();
            String novoEmail = emailNovo();

            var alteracao = Map.of("nome", "Ana Maria", "sobrenome", "Souza", "email", novoEmail,
                    "telefone", "11888888888", "idiomaPreferencial", "es");
            JsonNode perfil = corpo(enviar(put("/api/usuarios/me"), cliente.token(), alteracao).andExpect(status().isOk()));

            assertThat(perfil.get("nome").asString()).isEqualTo("Ana Maria");
            assertThat(perfil.get("idiomaPreferencial").asString()).isEqualTo("es");
            assertThat(perfil.get("papel").asString()).isEqualTo("CLIENTE");
            assertThat(perfil.get("preferencias").get("categoriaFavorita").asString()).isEqualTo("dogs");

            JsonNode lido = corpo(enviar(get("/api/usuarios/me"), cliente.token(), null).andExpect(status().isOk()));
            assertThat(lido.get("email").asString()).isEqualTo(novoEmail);
        }

        @Test
        void naoPermiteUsarEmailDeOutroUsuario() throws Exception {
            Cliente cliente = novoCliente();
            var alteracao = Map.of("nome", "Ana", "sobrenome", "Souza", "email", ADMIN_EMAIL);
            enviar(put("/api/usuarios/me"), cliente.token(), alteracao).andExpect(status().isConflict());
        }

        @Test
        void alterarSenhaExigeSenhaAtual() throws Exception {
            String email = emailNovo();
            cadastrar(email, List.of());
            String token = login(email, "SenhaForte1");

            enviar(put("/api/usuarios/me/senha"), token, Map.of("senhaAtual", "errada123", "novaSenha", "OutraSenha2"))
                    .andExpect(status().isUnprocessableContent());
            enviar(put("/api/usuarios/me/senha"), token, Map.of("senhaAtual", "SenhaForte1", "novaSenha", "OutraSenha2"))
                    .andExpect(status().isNoContent());

            login(email, "OutraSenha2");
        }

        @Test
        void perfilExigeLogin() throws Exception {
            enviar(get("/api/usuarios/me"), null, null).andExpect(status().isUnauthorized());
        }
    }

    // ------------------------------------------------------------------ RF07

    @Nested
    class BuscaDeAnimais {

        @Test
        void buscaPublicaSemDiferenciarAcentosNemMaiusculas() throws Exception {
            JsonNode pagina = corpo(enviar(get("/api/animais").param("termo", "PASTOR ALEMAO"), null, null)
                    .andExpect(status().isOk()));
            assertThat(pagina.get("conteudo")).isNotEmpty();
            assertThat(pagina.get("conteudo").get(0).get("raca").asString()).isEqualTo("Pastor Alemão");
        }

        @Test
        void filtraPorEspecieEPrecoEPagina() throws Exception {
            JsonNode pagina = corpo(enviar(get("/api/animais")
                    .param("especie", "Réptil").param("precoMax", "1000").param("size", "1"), null, null)
                    .andExpect(status().isOk()));
            assertThat(pagina.get("tamanho").asInt()).isEqualTo(1);
            assertThat(pagina.get("conteudo")).hasSize(1);
            assertThat(pagina.get("totalElementos").asLong()).isGreaterThanOrEqualTo(2);
            pagina.get("conteudo").forEach(a -> {
                assertThat(a.get("especie").asString()).isEqualTo("REPTIL");
                assertThat(a.get("preco").decimalValue()).isLessThanOrEqualTo(new java.math.BigDecimal("1000"));
            });
        }

        @Test
        void encontraPorTag() throws Exception {
            UUID animal = novoAnimal("Buscável", "100.00");
            assertThat(idsDaBusca("teste")).contains(animal.toString());
        }
    }

    // ------------------------------------------------------------------ RF08 / RF09

    @Nested
    class Carrinho {

        @Test
        void carrinhoExigeLogin() throws Exception {
            enviar(get("/api/carrinho"), null, null).andExpect(status().isUnauthorized());
        }

        @Test
        void adicionarERemoverItens() throws Exception {
            Cliente cliente = novoCliente();
            UUID a1 = novoAnimal("Bidu", "100.00");
            UUID a2 = novoAnimal("Pipoca", "250.50");

            JsonNode vazio = corpo(enviar(get("/api/carrinho"), cliente.token(), null).andExpect(status().isOk()));
            assertThat(vazio.get("itens")).isEmpty();
            assertThat(vazio.get("total").decimalValue()).isEqualByComparingTo("0");

            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", a1)).andExpect(status().isOk());
            // Adicionar o mesmo animal de novo não duplica (sem quantidade).
            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", a1)).andExpect(status().isOk());
            JsonNode carrinho = corpo(enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", a2))
                    .andExpect(status().isOk()));

            assertThat(carrinho.get("itens")).hasSize(2);
            assertThat(carrinho.get("total").decimalValue()).isEqualByComparingTo("350.50");

            carrinho = corpo(enviar(delete("/api/carrinho/itens/" + a1), cliente.token(), null).andExpect(status().isOk()));
            assertThat(carrinho.get("itens")).hasSize(1);
            assertThat(carrinho.get("total").decimalValue()).isEqualByComparingTo("250.50");

            enviar(delete("/api/carrinho/itens/" + a1), cliente.token(), null).andExpect(status().isNotFound());
        }

        @Test
        void animalInexistenteRetorna404() throws Exception {
            Cliente cliente = novoCliente();
            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }
    }

    // ------------------------------------------------------------------ RF06 + criar/cancelar pedido

    @Nested
    class Pedidos {

        @Test
        void fluxoCompletoEntregaCancelamento() throws Exception {
            Cliente comprador = novoCliente();
            Cliente outro = novoCliente();
            UUID animal = novoAnimal("Thor", "1200.00");

            enviar(post("/api/carrinho/itens"), comprador.token(), Map.of("animalId", animal)).andExpect(status().isOk());
            enviar(post("/api/carrinho/itens"), outro.token(), Map.of("animalId", animal)).andExpect(status().isOk());

            JsonNode pedido = corpo(enviar(post("/api/pedidos"), comprador.token(),
                    Map.of("modalidade", "ENTREGA", "enderecoId", comprador.enderecoId()))
                    .andExpect(status().isCreated()));

            assertThat(pedido.get("status").asString()).isEqualTo("AGUARDANDO_PAGAMENTO");
            assertThat(pedido.get("valorTotal").decimalValue()).isEqualByComparingTo("1200.00");
            assertThat(pedido.get("enderecoEntrega").get("rua").asString()).isEqualTo("Rua A");
            assertThat(pedido.get("itens")).hasSize(1);

            // Animal vendido: some da busca e de TODOS os carrinhos; não pode ser adicionado de novo.
            assertThat(idsDaBusca("Thor")).doesNotContain(animal.toString());
            assertThat(corpo(enviar(get("/api/carrinho"), comprador.token(), null)).get("itens")).isEmpty();
            assertThat(corpo(enviar(get("/api/carrinho"), outro.token(), null)).get("itens")).isEmpty();
            enviar(post("/api/carrinho/itens"), outro.token(), Map.of("animalId", animal))
                    .andExpect(status().isUnprocessableContent());

            // RF06
            JsonNode lista = corpo(enviar(get("/api/pedidos"), comprador.token(), null).andExpect(status().isOk()));
            assertThat(lista).hasSize(1);
            String pedidoId = pedido.get("id").asString();
            enviar(get("/api/pedidos/" + pedidoId), comprador.token(), null).andExpect(status().isOk());
            enviar(get("/api/pedidos/" + pedidoId), outro.token(), null).andExpect(status().isNotFound());

            // Outro usuário não cancela; o dono cancela e o animal volta a ficar disponível.
            enviar(post("/api/pedidos/" + pedidoId + "/cancelar"), outro.token(), null).andExpect(status().isNotFound());
            JsonNode cancelado = corpo(enviar(post("/api/pedidos/" + pedidoId + "/cancelar"), comprador.token(), null)
                    .andExpect(status().isOk()));
            assertThat(cancelado.get("status").asString()).isEqualTo("CANCELADO");
            assertThat(idsDaBusca("Thor")).contains(animal.toString());

            enviar(post("/api/pedidos/" + pedidoId + "/cancelar"), comprador.token(), null)
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        void enderecoDoPedidoNaoMudaQuandoOEnderecoEEditado() throws Exception {
            Cliente cliente = novoCliente();
            UUID animal = novoAnimal("Bolt", "300.00");
            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", animal)).andExpect(status().isOk());
            String pedidoId = corpo(enviar(post("/api/pedidos"), cliente.token(),
                    Map.of("modalidade", "ENTREGA", "enderecoId", cliente.enderecoId()))
                    .andExpect(status().isCreated())).get("id").asString();

            jdbc.query("select jpetstore.fn_remover_endereco((select usuario_id from jpetstore.endereco where id = ?), ?)",
                    rs -> { }, cliente.enderecoId(), cliente.enderecoId());

            JsonNode pedido = corpo(enviar(get("/api/pedidos/" + pedidoId), cliente.token(), null).andExpect(status().isOk()));
            assertThat(pedido.get("enderecoEntrega").get("rua").asString()).isEqualTo("Rua A");
        }

        @Test
        void retiradaNaoPrecisaDeEndereco() throws Exception {
            Cliente cliente = novoCliente();
            UUID animal = novoAnimal("Fumaça", "80.00");
            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", animal)).andExpect(status().isOk());

            JsonNode pedido = corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "RETIRADA"))
                    .andExpect(status().isCreated()));
            assertThat(pedido.get("modalidade").asString()).isEqualTo("RETIRADA");
            assertThat(pedido.get("enderecoEntrega").isNull()).isTrue();
        }

        @Test
        void regrasDeCriacao() throws Exception {
            Cliente cliente = novoCliente();
            JsonNode erro = corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "RETIRADA"))
                    .andExpect(status().isUnprocessableContent()));
            assertThat(erro.get("codigo").asString()).isEqualTo("CARRINHO_VAZIO");

            UUID animal = novoAnimal("Rabito", "90.00");
            enviar(post("/api/carrinho/itens"), cliente.token(), Map.of("animalId", animal)).andExpect(status().isOk());

            erro = corpo(enviar(post("/api/pedidos"), cliente.token(), Map.of("modalidade", "ENTREGA"))
                    .andExpect(status().isUnprocessableContent()));
            assertThat(erro.get("codigo").asString()).isEqualTo("ENDERECO_OBRIGATORIO");

            // Endereço sem rua/número (como o cadastro atual do front envia) não serve para entrega.
            String email = emailNovo();
            var semRua = endereco(null, null);
            JsonNode perfil = cadastrar(email, List.of(semRua));
            String token = login(email, "SenhaForte1");
            enviar(post("/api/carrinho/itens"), token, Map.of("animalId", novoAnimal("Lulu", "70.00"))).andExpect(status().isOk());
            erro = corpo(enviar(post("/api/pedidos"), token,
                    Map.of("modalidade", "ENTREGA", "enderecoId", perfil.get("enderecos").get(0).get("id").asString()))
                    .andExpect(status().isUnprocessableContent()));
            assertThat(erro.get("codigo").asString()).isEqualTo("ENDERECO_INCOMPLETO");

            // Endereço de outro usuário.
            erro = corpo(enviar(post("/api/pedidos"), cliente.token(),
                    Map.of("modalidade", "ENTREGA", "enderecoId", perfil.get("enderecos").get(0).get("id").asString()))
                    .andExpect(status().isNotFound()));
            assertThat(erro.get("codigo").asString()).isEqualTo("ENDERECO_NAO_ENCONTRADO");
        }
    }

    // ------------------------------------------------------------------ RNF05

    @Nested
    class ControleDeAcessoAdministrativo {

        @Test
        void anonimoRecebe401() throws Exception {
            enviar(get("/api/admin/acesso"), null, null).andExpect(status().isUnauthorized());
        }

        @Test
        void clienteRecebe403() throws Exception {
            enviar(get("/api/admin/acesso"), novoCliente().token(), null).andExpect(status().isForbidden());
        }

        @Test
        void adminTemAcesso() throws Exception {
            JsonNode acesso = corpo(enviar(get("/api/admin/acesso"), login(ADMIN_EMAIL, ADMIN_SENHA), null)
                    .andExpect(status().isOk()));
            assertThat(acesso.get("autorizado").asBoolean()).isTrue();
        }

        @Test
        void tokenAdulteradoRecebe401() throws Exception {
            String token = novoCliente().token();
            String adulterado = token.substring(0, token.length() - 2) + (token.endsWith("A") ? "BB" : "AA");
            enviar(get("/api/admin/acesso"), adulterado, null).andExpect(status().isUnauthorized());
        }
    }
}
