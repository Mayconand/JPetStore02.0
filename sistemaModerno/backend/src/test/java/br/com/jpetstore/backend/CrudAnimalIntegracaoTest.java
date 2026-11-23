package br.com.jpetstore.backend;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockPart;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** CRUD administrativo de animais e raças (RF23, RF24, RF26, RF27, RF28), com fotos e laudos no banco. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(BancoDeTesteConfig.class)
class CrudAnimalIntegracaoTest {

    static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 1, 2, 3};
    static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 1, 2, 3};
    static final byte[] PDF = "%PDF-1.7 laudo de teste".getBytes(StandardCharsets.US_ASCII);

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

    JsonNode corpo(ResultActions resultado) throws Exception {
        return json.readTree(resultado.andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8));
    }

    String login(String email, String senha) throws Exception {
        return corpo(enviar(post("/api/auth/login"), null, Map.of("email", email, "senha", senha))
                .andExpect(status().isOk())).get("token").asString();
    }

    String loginCliente() throws Exception {
        return login("cliente@jpetstore.com", "Cliente@123");
    }

    ResultActions enviar(AbstractMockHttpServletRequestBuilder<?> req, String token, Object body) throws Exception {
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
        }
        return mvc.perform(req);
    }

    ResultActions enviarFormulario(HttpMethod metodo, String url, String token, Map<String, Object> dados,
                                   MockMultipartFile... arquivos) throws Exception {
        var req = multipart(metodo, url);
        if (dados != null) {
            MockPart parte = new MockPart("dados", json.writeValueAsBytes(dados));
            parte.getHeaders().setContentType(MediaType.APPLICATION_JSON);
            req.part(parte);
        }
        Arrays.stream(arquivos).forEach(req::file);
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        return mvc.perform(req);
    }

    ResultActions cadastrar(Map<String, Object> dados, MockMultipartFile... arquivos) throws Exception {
        return enviarFormulario(HttpMethod.POST, "/api/admin/animais", admin, dados, arquivos);
    }

    JsonNode cadastrado(Map<String, Object> dados, MockMultipartFile... arquivos) throws Exception {
        return corpo(cadastrar(dados, arquivos).andExpect(status().isCreated()));
    }

    ResultActions editar(String id, Map<String, Object> dados, MockMultipartFile... arquivos) throws Exception {
        return enviarFormulario(HttpMethod.PUT, "/api/admin/animais/" + id, admin, dados, arquivos);
    }

    JsonNode erro(ResultActions resultado, int status, String codigo) throws Exception {
        JsonNode corpo = corpo(resultado.andExpect(status().is(status)));
        assertThat(corpo.get("codigo").asString()).isEqualTo(codigo);
        return corpo;
    }

    MockMultipartFile principal(byte[] conteudo) {
        return new MockMultipartFile("imagemPrincipal", "capa.png", "image/png", conteudo);
    }

    MockMultipartFile foto(byte[] conteudo) {
        return new MockMultipartFile("fotos", "foto.jpg", "image/jpeg", conteudo);
    }

    MockMultipartFile laudo(String nome, byte[] conteudo) {
        return new MockMultipartFile("laudos", nome, "application/pdf", conteudo);
    }

    String raca(String especie, String nome) {
        return jdbc.queryForObject("select id from jpetstore.raca where especie = ? and nome = ?", UUID.class, especie, nome).toString();
    }

    String unico(String prefixo) {
        return prefixo + " " + UUID.randomUUID().toString().substring(0, 8);
    }

    Map<String, Object> dados(String especie, String raca, Map<String, Object> extras) {
        Map<String, Object> dados = new HashMap<>(Map.of(
                "especie", especie, "racaId", raca(especie, raca), "nome", unico("Pet"), "preco", 150.50));
        dados.putAll(extras);
        return dados;
    }

    Map<String, Object> cachorro() {
        return dados("CACHORRO", "Poodle", Map.of());
    }

    long arquivosNoBanco() {
        return jdbc.queryForObject("select count(*) from jpetstore.arquivo", Long.class);
    }

    // ------------------------------------------------------------------ animais

    @Nested
    class CadastrarAnimal {

        @Test
        void cachorroComTodosOsCamposDaTela() throws Exception {
            JsonNode animal = cadastrado(
                    dados("CACHORRO", "Poodle", Map.of("porte", "PEQUENO", "altura", 35.5, "peso", 6.25,
                            "dataNascimento", "2025-02-10", "descricao", "Muito dócil", "tags", List.of("Atlético", "Calmo"))),
                    principal(PNG), foto(JPEG), foto(JPEG), foto(JPEG), laudo("Vacinação 2026.pdf", PDF));

            assertThat(animal.get("especie").asString()).isEqualTo("CACHORRO");
            assertThat(animal.get("raca").get("nome").asString()).isEqualTo("Poodle");
            assertThat(animal.get("dataNascimento").asString()).isEqualTo("2025-02-10");
            assertThat(animal.get("atributos").get("porte").asString()).isEqualTo("PEQUENO");
            assertThat(animal.get("atributos").get("altura").asDouble()).isEqualTo(35.5);
            assertThat(animal.get("atributos").get("peso").asDouble()).isEqualTo(6.25);
            assertThat(animal.get("tags")).hasSize(2);
            assertThat(animal.get("galeria")).hasSize(4);
            assertThat(animal.get("galeria").get(0).get("principal").asBoolean()).isTrue();
            assertThat(animal.get("laudos").get(0).get("titulo").asString()).isEqualTo("Vacinação 2026");
        }

        @Test
        void atributosDeCadaEspecie() throws Exception {
            JsonNode gato = cadastrado(dados("GATO", "Persa", Map.of("porte", "MEDIO", "pelagem", "Longa", "altura", 25, "peso", 4)));
            assertThat(gato.get("atributos").get("pelagem").asString()).isEqualTo("Longa");
            assertThat(gato.get("atributos").get("peso").asDouble()).isEqualTo(4);

            JsonNode passaro = cadastrado(dados("PASSARO", "Calopsita", Map.of("plumagem", "Lutino")));
            assertThat(passaro.get("atributos").get("plumagem").asString()).isEqualTo("Lutino");

            JsonNode peixe = cadastrado(dados("PEIXE", "Betta", Map.of("tipoDeAgua", "DOCE", "estirpe", "Halfmoon",
                    "ph", 7.2, "expectativaDeVida", "2 a 5 anos")));
            assertThat(peixe.get("atributos").get("tipoDeAgua").asString()).isEqualTo("DOCE");
            assertThat(peixe.get("atributos").get("ph").asDouble()).isEqualTo(7.2);
            assertThat(peixe.get("atributos").get("expectativaDeVida").asString()).isEqualTo("2 a 5 anos");

            JsonNode reptil = cadastrado(dados("REPTIL", "Gecko", Map.of("grupo", "LAGARTOS", "mutacao", "Albino", "altura", 8, "peso", 0.075)));
            assertThat(reptil.get("atributos").get("grupo").asString()).isEqualTo("LAGARTOS");
            assertThat(reptil.get("atributos").get("peso").asDouble()).isEqualTo(0.075);
        }

        @Test
        void recusaDadosInvalidos() throws Exception {
            JsonNode campos = erro(cadastrar(Map.of("especie", "CACHORRO")), 400, "DADOS_INVALIDOS").get("campos");
            assertThat(campos.propertyNames()).containsExactlyInAnyOrder("nome", "racaId", "preco");
            erro(cadastrar(dados("CACHORRO", "Poodle", Map.of("tags", List.of("a", "b", "c", "d", "e", "f")))), 400, "DADOS_INVALIDOS");
            erro(cadastrar(dados("CACHORRO", "Poodle", Map.of("peso", -1))), 400, "DADOS_INVALIDOS");
            erro(cadastrar(dados("CACHORRO", "Poodle", Map.of("dataNascimento", "2999-01-01"))), 400, "DADOS_INVALIDOS");
            erro(cadastrar(dados("CACHORRO", "Poodle", Map.of("porte", "GIGANTE"))), 400, "REQUISICAO_INVALIDA");
            erro(cadastrar(dados("GATO", "Persa", Map.of("racaId", raca("CACHORRO", "Poodle")))), 422, "RACA_INVALIDA");

            Map<String, Object> semEspecie = cachorro();
            semEspecie.remove("especie");
            erro(cadastrar(semEspecie), 400, "ESPECIE_OBRIGATORIA");
            erro(cadastrar(null), 400, "REQUISICAO_INVALIDA");
            erro(enviar(post("/api/admin/animais"), admin, cachorro()), 415, "FORMATO_NAO_SUPORTADO");
        }

        @Test
        void recusaArquivosInvalidosSemGravarNada() throws Exception {
            long antes = arquivosNoBanco();
            Map<String, Object> dados = cachorro();

            erro(cadastrar(dados, principal("<svg/>".getBytes())), 422, "IMAGEM_INVALIDA");
            erro(cadastrar(dados, laudo("falso.pdf", PNG)), 422, "LAUDO_INVALIDO");
            erro(cadastrar(dados, principal(Arrays.copyOf(PNG, 2 * 1024 * 1024 + 1))), 413, "ARQUIVO_MUITO_GRANDE");
            erro(cadastrar(dados, laudo("grande.pdf", Arrays.copyOf(PDF, 10 * 1024 * 1024 + 1))), 413, "ARQUIVO_MUITO_GRANDE");
            // O limite de fotos é conferido pelo banco: o animal já inserido precisa ser desfeito.
            erro(cadastrar(dados, principal(PNG), foto(JPEG), foto(JPEG), foto(JPEG), foto(JPEG)), 422, "LIMITE_DE_FOTOS");

            assertThat(arquivosNoBanco()).isEqualTo(antes);
            assertThat(jdbc.queryForObject("select count(*) from jpetstore.animal where nome = ?", Long.class, dados.get("nome"))).isZero();
        }

        @Test
        void somenteAdministrador() throws Exception {
            enviarFormulario(HttpMethod.POST, "/api/admin/animais", null, cachorro()).andExpect(status().isUnauthorized());
            enviarFormulario(HttpMethod.POST, "/api/admin/animais", loginCliente(), cachorro()).andExpect(status().isForbidden());
        }
    }

    @Nested
    class ConsultarAnimal {

        @Test
        void listaIncluiIndisponiveisComFiltrosEPaginacao() throws Exception {
            String marca = unico("Lista");
            Map<String, Object> a = dados("GATO", "Persa", Map.of("nome", marca + " A", "pelagem", "Longa"));
            Map<String, Object> b = dados("GATO", "Persa", Map.of("nome", marca + " B", "disponivel", false));
            cadastrado(a, laudo("x.pdf", PDF));
            cadastrado(b);
            cadastrado(dados("CACHORRO", "Poodle", Map.of("nome", marca + " C")));

            JsonNode gatos = corpo(enviar(get("/api/admin/animais").param("termo", marca).param("especie", "Gato"), admin, null)
                    .andExpect(status().isOk()));
            assertThat(gatos.get("totalElementos").asInt()).isEqualTo(2);
            assertThat(gatos.get("conteudo").get(0).get("atributos").get("pelagem").asString()).isEqualTo("Longa");
            assertThat(gatos.get("conteudo").get(0).get("quantidadeLaudos").asInt()).isEqualTo(1);
            assertThat(gatos.get("conteudo").get(1).get("disponivel").asBoolean()).isFalse();

            JsonNode pagina = corpo(enviar(get("/api/admin/animais").param("termo", marca).param("size", "2").param("page", "1"), admin, null));
            assertThat(pagina.get("conteudo")).hasSize(1);
            assertThat(pagina.get("totalPaginas").asInt()).isEqualTo(2);

            JsonNode indisponiveis = corpo(enviar(get("/api/admin/animais").param("termo", marca).param("disponivel", "false"), admin, null));
            assertThat(indisponiveis.get("totalElementos").asInt()).isEqualTo(1);

            JsonNode peloLongo = corpo(enviar(get("/api/admin/animais").param("termo", marca).param("atributo", "longa"), admin, null));
            assertThat(peloLongo.get("totalElementos").asInt()).isEqualTo(1);
            assertThat(peloLongo.get("conteudo").get(0).get("nome").asString()).isEqualTo(marca + " A");
        }

        @Test
        void valoresDigitadosViramOpcoes() throws Exception {
            String plumagem = unico("Plumagem");
            cadastrado(dados("PASSARO", "Calopsita", Map.of("plumagem", plumagem)));

            JsonNode valores = corpo(enviar(get("/api/admin/animais/valores").param("especie", "PASSARO"), admin, null).andExpect(status().isOk()));
            assertThat(valores.valueStream().map(JsonNode::asString)).contains(plumagem);
            assertThat(corpo(enviar(get("/api/admin/animais/valores").param("especie", "CACHORRO"), admin, null))).isEmpty();
            enviar(get("/api/admin/animais/valores").param("especie", "PASSARO"), loginCliente(), null).andExpect(status().isForbidden());
        }

        @Test
        void fotoPrincipalApareceNoCatalogoPublico() throws Exception {
            Map<String, Object> dados = cachorro();
            JsonNode animal = cadastrado(dados, foto(JPEG), principal(PNG));
            String url = animal.get("galeria").get(0).get("url").asString();

            JsonNode catalogo = corpo(enviar(get("/api/animais").param("termo", (String) dados.get("nome")), null, null));
            assertThat(catalogo.get("conteudo").get(0).get("imagemUrl").asString()).isEqualTo(url);

            enviar(get(url), null, null).andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.IMAGE_PNG))
                    .andExpect(content().bytes(PNG));
            erro(enviar(get("/api/animais/imagens/" + UUID.randomUUID()), null, null), 404, "ARQUIVO_NAO_ENCONTRADO");
        }

        @Test
        void laudoExigeLogin() throws Exception {
            JsonNode animal = cadastrado(cachorro(), laudo("Exame.pdf", PDF));
            String url = animal.get("laudos").get(0).get("arquivoUrl").asString();

            enviar(get(url), null, null).andExpect(status().isUnauthorized());
            enviar(get(url), loginCliente(), null).andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                    .andExpect(content().bytes(PDF));

            JsonNode laudos = corpo(enviar(get("/api/admin/animais/" + animal.get("id").asString() + "/laudos"), admin, null)
                    .andExpect(status().isOk()));
            assertThat(laudos.get(0).get("titulo").asString()).isEqualTo("Exame");
            erro(enviar(get("/api/admin/animais/" + UUID.randomUUID() + "/laudos"), admin, null), 404, "ANIMAL_NAO_ENCONTRADO");
        }
    }

    @Nested
    class EditarAnimal {

        @Test
        void substituiOsCamposDoFormulario() throws Exception {
            Map<String, Object> dados = dados("GATO", "Persa", Map.of("pelagem", "Longa", "peso", 4, "descricao", "Antiga",
                    "castrado", true, "tags", List.of("Calmo")));
            String id = cadastrado(dados, principal(PNG)).get("id").asString();

            JsonNode editado = corpo(editar(id, dados("GATO", "Siamês", Map.of("nome", "Novo nome", "preco", 99, "pelagem", "Curta")))
                    .andExpect(status().isOk()));

            assertThat(editado.get("nome").asString()).isEqualTo("Novo nome");
            assertThat(editado.get("raca").get("nome").asString()).isEqualTo("Siamês");
            assertThat(editado.get("atributos").get("pelagem").asString()).isEqualTo("Curta");
            // Campo apagado no formulário fica vazio.
            assertThat(editado.get("atributos").get("peso").isNull()).isTrue();
            assertThat(editado.get("descricao").isNull()).isTrue();
            // Não enviados: castrado, tags e arquivos permanecem.
            assertThat(editado.get("castrado").asBoolean()).isTrue();
            assertThat(editado.get("tags")).hasSize(1);
            assertThat(editado.get("galeria")).hasSize(1);
        }

        @Test
        void trocaPrincipalERemoveFotosELaudosNaMesmaRequisicao() throws Exception {
            long antes = arquivosNoBanco();
            JsonNode animal = cadastrado(cachorro(), principal(PNG), foto(JPEG), foto(JPEG), foto(JPEG), laudo("a.pdf", PDF));
            String id = animal.get("id").asString();
            String fotoAntiga = animal.get("galeria").get(1).get("id").asString();
            String laudoAntigo = animal.get("laudos").get(0).get("id").asString();

            Map<String, Object> dados = cachorro();
            dados.put("tags", List.of());
            dados.put("imagensRemovidas", List.of(fotoAntiga));
            dados.put("laudosRemovidos", List.of(laudoAntigo));
            JsonNode editado = corpo(editar(id, dados, principal(JPEG), foto(PNG), laudo("b.pdf", PDF)).andExpect(status().isOk()));

            assertThat(editado.get("galeria")).hasSize(4);
            assertThat(editado.get("galeria").toString()).doesNotContain(fotoAntiga, animal.get("galeria").get(0).get("id").asString());
            assertThat(editado.get("laudos")).hasSize(1);
            assertThat(editado.get("laudos").get(0).get("titulo").asString()).isEqualTo("b");
            assertThat(arquivosNoBanco()).isEqualTo(antes + 5);
        }

        @Test
        void erroDesfazTudo() throws Exception {
            Map<String, Object> dados = cachorro();
            JsonNode animal = cadastrado(dados, foto(JPEG), foto(JPEG), foto(JPEG));
            String id = animal.get("id").asString();

            Map<String, Object> novos = cachorro();
            erro(editar(id, novos, foto(JPEG)), 422, "LIMITE_DE_FOTOS");

            JsonNode atual = corpo(enviar(get("/api/admin/animais/" + id), admin, null).andExpect(status().isOk()));
            assertThat(atual.get("nome").asString()).isEqualTo(dados.get("nome"));
            assertThat(atual.get("galeria")).hasSize(3);
        }

        @Test
        void naoRemoveArquivoDeOutroAnimalNemTrocaEspecie() throws Exception {
            String imagemDeOutro = cadastrado(cachorro(), principal(PNG)).get("galeria").get(0).get("id").asString();
            String laudoDeOutro = cadastrado(cachorro(), laudo("a.pdf", PDF)).get("laudos").get(0).get("id").asString();
            String id = cadastrado(cachorro()).get("id").asString();

            erro(editar(id, dados("CACHORRO", "Poodle", Map.of("imagensRemovidas", List.of(imagemDeOutro)))), 404, "IMAGEM_NAO_ENCONTRADA");
            erro(editar(id, dados("CACHORRO", "Poodle", Map.of("laudosRemovidos", List.of(laudoDeOutro)))), 404, "LAUDO_NAO_ENCONTRADO");
            erro(editar(id, dados("GATO", "Persa", Map.of())), 422, "ESPECIE_NAO_PODE_MUDAR");
            erro(editar(UUID.randomUUID().toString(), cachorro()), 404, "ANIMAL_NAO_ENCONTRADO");
        }
    }

    @Nested
    class ExcluirAnimal {

        @Test
        void apagaOAnimalEOsArquivos() throws Exception {
            long antes = arquivosNoBanco();
            String id = cadastrado(cachorro(), principal(PNG), foto(JPEG), laudo("a.pdf", PDF)).get("id").asString();

            enviar(delete("/api/admin/animais/" + id), admin, null).andExpect(status().isNoContent());

            assertThat(arquivosNoBanco()).isEqualTo(antes);
            erro(enviar(get("/api/admin/animais/" + id), admin, null), 404, "ANIMAL_NAO_ENCONTRADO");
            erro(enviar(delete("/api/admin/animais/" + id), admin, null), 404, "ANIMAL_NAO_ENCONTRADO");
        }

        @Test
        void clienteNaoExclui() throws Exception {
            String id = cadastrado(cachorro()).get("id").asString();
            enviar(delete("/api/admin/animais/" + id), loginCliente(), null).andExpect(status().isForbidden());
        }
    }

    // ------------------------------------------------------------------ raças

    @Nested
    class Racas {

        @Test
        void cicloCompleto() throws Exception {
            String nome = unico("Raça");
            JsonNode raca = corpo(enviar(post("/api/admin/racas"), admin, Map.of("especie", "PEIXE", "nome", nome, "descricao", "Teste"))
                    .andExpect(status().isCreated()));
            String url = "/api/admin/racas/" + raca.get("id").asString();
            assertThat(raca.get("especie").asString()).isEqualTo("PEIXE");

            JsonNode lista = corpo(enviar(get("/api/admin/racas").param("especie", "peixe").param("termo", nome.replace("ç", "c")), admin, null)
                    .andExpect(status().isOk()));
            assertThat(lista).hasSize(1);

            JsonNode editada = corpo(enviar(put(url), admin, Map.of("nome", nome + " 2")).andExpect(status().isOk()));
            assertThat(editada.get("nome").asString()).isEqualTo(nome + " 2");
            assertThat(editada.get("descricao").isNull()).isTrue();

            enviar(delete(url), admin, null).andExpect(status().isNoContent());
            erro(enviar(get(url), admin, null), 404, "RACA_NAO_ENCONTRADA");
            erro(enviar(put(url), admin, Map.of("nome", "X")), 404, "RACA_NAO_ENCONTRADA");
            erro(enviar(delete(url), admin, null), 404, "RACA_NAO_ENCONTRADA");
        }

        @Test
        void racaNovaPodeSerUsadaNoCadastroEEntaoNaoPodeSerExcluida() throws Exception {
            String id = corpo(enviar(post("/api/admin/racas"), admin, Map.of("especie", "CACHORRO", "nome", unico("Nova")))).get("id").asString();
            cadastrado(dados("CACHORRO", "Poodle", Map.of("racaId", id)));

            assertThat(corpo(enviar(get("/api/admin/racas/" + id), admin, null)).get("quantidadeAnimais").asInt()).isEqualTo(1);
            erro(enviar(delete("/api/admin/racas/" + id), admin, null), 409, "RACA_EM_USO");
        }

        @Test
        void racaNovaApareceNoFiltroDoCliente() throws Exception {
            String nome = unico("Filtro");
            enviar(post("/api/admin/racas"), admin, Map.of("especie", "REPTIL", "nome", nome)).andExpect(status().isCreated());

            JsonNode repteis = corpo(enviar(get("/api/animais/racas").param("especie", "Réptil"), null, null).andExpect(status().isOk()));
            JsonNode gatos = corpo(enviar(get("/api/animais/racas").param("especie", "Gato"), null, null).andExpect(status().isOk()));

            assertThat(repteis.valueStream().map(JsonNode::asString)).contains(nome, "Iguana");
            assertThat(gatos.valueStream().map(JsonNode::asString)).contains("Persa").doesNotContain(nome);
        }

        @Test
        void recusaDuplicadaEInvalida() throws Exception {
            String a = unico("A");
            enviar(post("/api/admin/racas"), admin, Map.of("especie", "GATO", "nome", a)).andExpect(status().isCreated());
            String b = corpo(enviar(post("/api/admin/racas"), admin, Map.of("especie", "GATO", "nome", unico("B")))).get("id").asString();

            erro(enviar(post("/api/admin/racas"), admin, Map.of("especie", "GATO", "nome", a.toUpperCase())), 409, "RACA_JA_CADASTRADA");
            erro(enviar(put("/api/admin/racas/" + b), admin, Map.of("nome", a)), 409, "RACA_JA_CADASTRADA");
            erro(enviar(post("/api/admin/racas"), admin, Map.of("especie", "GATO", "nome", " ")), 400, "DADOS_INVALIDOS");
            erro(enviar(post("/api/admin/racas"), admin, Map.of("especie", "DINOSSAURO", "nome", "Rex")), 400, "REQUISICAO_INVALIDA");
        }

        @Test
        void somenteAdministrador() throws Exception {
            enviar(get("/api/admin/racas"), null, null).andExpect(status().isUnauthorized());
            enviar(post("/api/admin/racas"), loginCliente(), Map.of("especie", "GATO", "nome", "X")).andExpect(status().isForbidden());
        }
    }
}
