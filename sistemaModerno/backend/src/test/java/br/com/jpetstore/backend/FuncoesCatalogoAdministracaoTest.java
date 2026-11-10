package br.com.jpetstore.backend;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Ticket 02 — funções de banco de catálogo, conteúdo institucional e administração
 * (RF01, RF11, RF16, RF17, RF18–RF20, RF22, RF23–RF28, RF30).
 */
class FuncoesCatalogoAdministracaoTest extends FuncoesBancoTestBase {

    UUID racaPorNome(String nome) {
        return valor("id from jpetstore.raca where nome = ?", UUID.class, nome);
    }

    UUID cadastrarAnimal(String especie, Map<String, Object> dados) {
        return valor("jpetstore.fn_cadastrar_animal(?, ?::jsonb)", UUID.class, especie, json.writeValueAsString(dados));
    }

    JsonNode obterAnimal(UUID id) {
        return jsonDe("jpetstore.fn_obter_animal(?)", id);
    }

    List<String> textos(JsonNode array) {
        return array.valueStream().map(JsonNode::asString).toList();
    }

    @Nested
    class Especies {

        long disponiveis(String codigo) {
            return valor("quantidade_disponivel from jpetstore.fn_listar_especies() where codigo = ?", Long.class, codigo);
        }

        @Test
        void listaAsCincoEspeciesComCuidados() {
            List<String> codigos = jdbc.queryForList(
                    "select codigo from jpetstore.fn_listar_especies() where cuidados is not null", String.class);

            assertThat(codigos).containsExactlyInAnyOrder("CACHORRO", "GATO", "PASSARO", "PEIXE", "REPTIL");
        }

        @Test
        void contaApenasAnimaisDisponiveis() {
            long antes = disponiveis("REPTIL");
            UUID disponivel = cadastrarAnimal("REPTIL", Map.of("racaId", racaPorNome("Gecko"), "nome", "Lagartixa", "preco", 80));
            cadastrarAnimal("REPTIL", Map.of("racaId", racaPorNome("Gecko"), "nome", "Reservada", "preco", 80, "disponivel", false));

            assertThat(disponiveis("REPTIL")).isEqualTo(antes + 1);
            assertThat(disponivel).isNotNull();
        }
    }

    @Nested
    class VisualizarAnimal {

        @Test
        void devolveRacaAtributosDaEspecieImagensTagsELaudos() {
            UUID gato = cadastrarAnimal("Gato", Map.of(
                    "racaId", racaPorNome("Maine Coon"), "nome", "Thor", "preco", 2200, "sexo", "MACHO",
                    "dataNascimento", "2025-01-15", "porte", "GRANDE", "pelagem", "Longa",
                    "imagens", List.of("https://exemplo.com/thor.jpg"),
                    "tags", List.of("Sociável", "Grande"),
                    "laudos", List.of(Map.of("titulo", "Vacinação", "dataEmissao", "2026-01-10"))));

            JsonNode animal = obterAnimal(gato);

            assertThat(animal.get("especie").asString()).isEqualTo("GATO");
            assertThat(animal.get("raca").get("nome").asString()).isEqualTo("Maine Coon");
            assertThat(animal.get("sexo").asString()).isEqualTo("MACHO");
            assertThat(animal.get("atributos").get("porte").asString()).isEqualTo("GRANDE");
            assertThat(animal.get("atributos").get("pelagem").asString()).isEqualTo("Longa");
            assertThat(textos(animal.get("imagens"))).containsExactly("https://exemplo.com/thor.jpg");
            assertThat(textos(animal.get("tags"))).containsExactly("Grande", "Sociável");
            assertThat(animal.get("laudos").get(0).get("titulo").asString()).isEqualTo("Vacinação");
            assertThat(animal.get("cuidados").asString()).isNotBlank();
        }

        @Test
        void atributosDoPeixe() {
            UUID peixe = cadastrarAnimal("PEIXE", Map.of(
                    "racaId", racaPorNome("Betta"), "nome", "Azulão", "preco", 35,
                    "tipoDeAgua", "DOCE", "estirpe", "Halfmoon", "ph", 6.8));

            JsonNode atributos = obterAnimal(peixe).get("atributos");

            assertThat(atributos.get("tipoDeAgua").asString()).isEqualTo("DOCE");
            assertThat(atributos.get("estirpe").asString()).isEqualTo("Halfmoon");
            assertThat(atributos.get("ph").asDouble()).isEqualTo(6.8);
        }

        @Test
        void animalInexistenteNaoEEncontrado() {
            deveFalhar("JP404", "ANIMAL_NAO_ENCONTRADO", () -> obterAnimal(UUID.randomUUID()));
        }
    }

    @Nested
    class BuscarTags {

        @Test
        void encontraPorTrechoSemDiferenciarAcentos() {
            String sufixo = codigoUnico("");
            String tag = "Saltitão" + sufixo;
            cadastrarAnimal("CACHORRO", Map.of("racaId", racaPorNome("Poodle"), "nome", "Pula", "preco", 10, "tags", List.of(tag)));

            List<String> encontradas = jdbc.queryForList(
                    "select nome from jpetstore.fn_buscar_tags(?)", String.class, "SALTITAO" + sufixo);

            assertThat(encontradas).containsExactly(tag);
        }
    }

    @Nested
    class SelecionarIdioma {

        @Test
        void aceitaIdiomasSuportados() {
            UUID usuario = novoUsuario();

            executar("jpetstore.fn_selecionar_idioma(?, 'es')", usuario);

            assertThat(jsonDe("jpetstore.fn_obter_perfil(?)", usuario).get("idiomaPreferencial").asString()).isEqualTo("es");
        }

        @Test
        void recusaIdiomaNaoSuportado() {
            UUID usuario = novoUsuario();
            deveFalhar("JP422", "IDIOMA_INVALIDO", () -> executar("jpetstore.fn_selecionar_idioma(?, 'fr')", usuario));
        }
    }

    @Nested
    class AjudaERodape {

        @Test
        void ajudaListaEmOrdemEFiltraPorTermo() {
            List<String> titulos = jdbc.queryForList("select titulo from jpetstore.fn_listar_ajuda()", String.class);
            List<String> filtrados = jdbc.queryForList("select titulo from jpetstore.fn_listar_ajuda('CANCELAR')", String.class);

            assertThat(titulos).startsWith("Como comprar um animal?", "Posso cancelar meu pedido?");
            assertThat(filtrados).containsExactly("Posso cancelar meu pedido?");
        }

        @Test
        void desabilitarHabilitarEPersonalizarRodape() {
            executar("jpetstore.fn_desabilitar_rodape()");
            assertThat(jsonDe("jpetstore.fn_obter_rodape()").get("visivel").asBoolean()).isFalse();

            executar("jpetstore.fn_personalizar_rodape(?)", "<p>Novo rodapé</p>");
            executar("jpetstore.fn_habilitar_rodape()");

            JsonNode rodape = jsonDe("jpetstore.fn_obter_rodape()");
            assertThat(rodape.get("visivel").asBoolean()).isTrue();
            assertThat(rodape.get("conteudoHtml").asString()).isEqualTo("<p>Novo rodapé</p>");
        }
    }

    @Nested
    class AdministracaoDeRacasEAnimais {

        @Test
        void cadastrarRacaRecusaDuplicadaEEspecieInvalida() {
            String nome = "Raça " + codigoUnico("");
            UUID raca = valor("jpetstore.fn_cadastrar_raca('Pássaro', ?, 'Teste')", UUID.class, nome);

            assertThat(valor("especie from jpetstore.raca where id = ?", String.class, raca)).isEqualTo("PASSARO");
            deveFalhar("JP409", "RACA_JA_CADASTRADA",
                    () -> valor("jpetstore.fn_cadastrar_raca('PASSARO', ?)", UUID.class, nome.toUpperCase()));
            deveFalhar("JP422", "ESPECIE_INVALIDA",
                    () -> valor("jpetstore.fn_cadastrar_raca('DINOSSAURO', 'Rex')", UUID.class));
        }

        @Test
        void cadastrarAnimalRecusaRacaDeOutraEspecieEDadosIncompletos() {
            deveFalhar("JP422", "RACA_INVALIDA", () -> cadastrarAnimal("GATO",
                    Map.of("racaId", racaPorNome("Poodle"), "nome", "Confuso", "preco", 10)));
            deveFalhar("JP422", "DADOS_INVALIDOS", () -> cadastrarAnimal("CACHORRO",
                    Map.of("racaId", racaPorNome("Poodle"), "preco", 10)));
            deveFalhar("JP422", "DADOS_INVALIDOS", () -> cadastrarAnimal("CACHORRO",
                    Map.of("racaId", racaPorNome("Poodle"), "nome", "Sem preço")));
        }

        @Test
        void editarAlteraSomenteOsCamposEnviados() {
            UUID gato = cadastrarAnimal("GATO", Map.of(
                    "racaId", racaPorNome("Persa"), "nome", "Mimi", "preco", 900, "descricao", "Calma",
                    "porte", "PEQUENO", "pelagem", "Longa", "tags", List.of("Calma"), "imagens", List.of("a.jpg")));

            JsonNode editado = jsonDe("jpetstore.fn_editar_animal(?, ?::jsonb)", gato,
                    json.writeValueAsString(Map.of("preco", 1100, "pelagem", "Semi-longa", "tags", List.of("Dócil", "Calma"))));

            assertThat(editado.get("preco").decimalValue()).isEqualByComparingTo("1100");
            assertThat(editado.get("atributos").get("pelagem").asString()).isEqualTo("Semi-longa");
            assertThat(textos(editado.get("tags"))).containsExactly("Calma", "Dócil");
            // Campos não enviados permanecem.
            assertThat(editado.get("nome").asString()).isEqualTo("Mimi");
            assertThat(editado.get("descricao").asString()).isEqualTo("Calma");
            assertThat(editado.get("atributos").get("porte").asString()).isEqualTo("PEQUENO");
            assertThat(textos(editado.get("imagens"))).containsExactly("a.jpg");
        }

        @Test
        void excluirAnimal() {
            UUID semPedido = novoAnimal("10.00");
            executar("jpetstore.fn_excluir_animal(?)", semPedido);
            deveFalhar("JP404", "ANIMAL_NAO_ENCONTRADO", () -> obterAnimal(semPedido));

            UUID usuario = novoUsuario();
            UUID comPedido = novoAnimal("10.00");
            executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", usuario, comPedido);
            executar("jpetstore.fn_criar_pedido(?, 'RETIRADA')", usuario);
            deveFalhar("JP409", "ANIMAL_POSSUI_PEDIDOS", () -> executar("jpetstore.fn_excluir_animal(?)", comPedido));

            deveFalhar("JP404", "ANIMAL_NAO_ENCONTRADO", () -> executar("jpetstore.fn_excluir_animal(?)", UUID.randomUUID()));
        }

        @Test
        void verLaudosDoMaisRecenteParaOMaisAntigo() {
            UUID animal = novoAnimal("10.00");
            executar("jpetstore.fn_cadastrar_laudo(?, 'Antigo', null, date '2025-01-01')", animal);
            executar("jpetstore.fn_cadastrar_laudo(?, 'Recente', null, date '2026-06-01')", animal);

            List<String> titulos = jdbc.queryForList(
                    "select titulo from jpetstore.fn_listar_laudos(?)", String.class, animal);

            assertThat(titulos).containsExactly("Recente", "Antigo");
        }
    }

    @Nested
    class ClientesEPedidos {

        @Test
        void verClientesListaApenasQuemTemPedidosSemContarCancelados() {
            UUID comPedidos = novoUsuario();
            novoPedido(comPedidos, "300.00");
            UUID cancelado = novoPedido(comPedidos, "50.00");
            executar("jpetstore.fn_cancelar_pedido(?, ?)", comPedidos, cancelado);
            UUID semPedidos = novoUsuario();

            Map<String, Object> linha = jdbc.queryForMap(
                    "select quantidade_pedidos, valor_total_gasto from jpetstore.fn_listar_clientes() where id = ?", comPedidos);
            List<UUID> ids = jdbc.queryForList("select id from jpetstore.fn_listar_clientes()", UUID.class);

            assertThat(((Number) linha.get("quantidade_pedidos")).longValue()).isEqualTo(2);
            assertThat((BigDecimal) linha.get("valor_total_gasto")).isEqualByComparingTo("300.00");
            assertThat(ids).doesNotContain(semPedidos);
        }

        @Test
        void filtrarPedidosPorClienteStatusEPeriodo() {
            UUID usuario = novoUsuario();
            UUID aguardando = novoPedido(usuario, "10.00");
            UUID pago = novoPedido(usuario, "20.00");
            executar("jpetstore.fn_realizar_pagamento(?, ?, 'PIX')", usuario, pago);

            String sql = "select id from jpetstore.fn_filtrar_pedidos(?::jpetstore.status_pedido, ?::date, ?::date, ?)";

            assertThat(jdbc.queryForList(sql, UUID.class, null, null, null, usuario))
                    .containsExactlyInAnyOrder(aguardando, pago);
            assertThat(jdbc.queryForList(sql, UUID.class, "PAGO", null, null, usuario))
                    .containsExactly(pago);
            // Período inclusivo: "hoje até hoje" contém os pedidos de hoje.
            assertThat(jdbc.queryForList(sql, UUID.class, null, "today", "today", usuario))
                    .containsExactlyInAnyOrder(aguardando, pago);
            assertThat(jdbc.queryForList(sql, UUID.class, null, "yesterday", "yesterday", usuario))
                    .isEmpty();
            assertThat(jdbc.queryForList(sql, UUID.class, "AGUARDANDO_PAGAMENTO", "today", null, null))
                    .contains(aguardando)
                    .doesNotContain(pago);
        }
    }
}
