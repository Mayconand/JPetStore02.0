package br.com.jpetstore.backend;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Ticket 01 — funções de banco de compra e pagamento (RF13, RF14, RF29, RF15/RF21). */
class FuncoesCompraPagamentoTest extends FuncoesBancoTestBase {

    @Nested
    class CadastrarCartao {

        @Test
        void guardaApenasOsQuatroUltimosDigitos() {
            UUID usuario = novoUsuario();
            UUID cartao = valor("jpetstore.fn_cadastrar_cartao(?, ?, ?, ?, ?)", UUID.class,
                    usuario, "4111 1111 1111 1234", "Ana Souza", "12/30", "VISA");

            assertThat(valor("ultimos_digitos from jpetstore.cartao where id = ?", String.class, cartao))
                    .isEqualTo("1234");
        }

        @Test
        void numeroInvalidoERecusado() {
            UUID usuario = novoUsuario();
            deveFalhar("JP422", "CARTAO_INVALIDO", () -> valor("jpetstore.fn_cadastrar_cartao(?, ?, ?, ?, ?)",
                    UUID.class, usuario, "4111 1111", "Ana", "12/30", "VISA"));
        }

        @Test
        void cartaoVencidoERecusado() {
            UUID usuario = novoUsuario();
            deveFalhar("JP422", "CARTAO_VENCIDO", () -> valor("jpetstore.fn_cadastrar_cartao(?, ?, ?, ?, ?)",
                    UUID.class, usuario, "4111111111111111", "Ana", "01/20", "VISA"));
        }
    }

    @Nested
    class RealizarPagamento {

        UUID cartaoDe(UUID usuario) {
            return valor("jpetstore.fn_cadastrar_cartao(?, ?, ?, ?, ?)", UUID.class,
                    usuario, "5555444433331111", "Titular", "10/31", "MASTERCARD");
        }

        @Test
        void pagamentoComCartaoLevaOPedidoParaPago() {
            UUID usuario = novoUsuario();
            UUID pedido = novoPedido(usuario, "321.50");

            executar("jpetstore.fn_realizar_pagamento(?, ?, 'CARTAO_CREDITO', ?)", usuario, pedido, cartaoDe(usuario));

            var detalhe = jsonDe("jpetstore.fn_obter_pedido(?, ?)", usuario, pedido);
            assertThat(detalhe.get("status").asString()).isEqualTo("PAGO");
            assertThat(valor("valor from jpetstore.pagamento where pedido_id = ?", java.math.BigDecimal.class, pedido))
                    .isEqualByComparingTo("321.50");
        }

        @Test
        void pixNaoPrecisaDeCartao() {
            UUID usuario = novoUsuario();
            UUID pedido = novoPedido(usuario, "50.00");

            executar("jpetstore.fn_realizar_pagamento(?, ?, 'PIX')", usuario, pedido);

            assertThat(jsonDe("jpetstore.fn_obter_pedido(?, ?)", usuario, pedido).get("status").asString())
                    .isEqualTo("PAGO");
        }

        @Test
        void pedidoJaPagoNaoPodeSerPagoDeNovo() {
            UUID usuario = novoUsuario();
            UUID pedido = novoPedido(usuario, "50.00");
            executar("jpetstore.fn_realizar_pagamento(?, ?, 'PIX')", usuario, pedido);

            deveFalhar("JP422", "PEDIDO_NAO_AGUARDA_PAGAMENTO",
                    () -> executar("jpetstore.fn_realizar_pagamento(?, ?, 'PIX')", usuario, pedido));
        }

        @Test
        void cartaoDeOutroUsuarioOuAusenteERecusado() {
            UUID usuario = novoUsuario();
            UUID pedido = novoPedido(usuario, "50.00");
            UUID cartaoAlheio = cartaoDe(novoUsuario());

            deveFalhar("JP422", "CARTAO_OBRIGATORIO", () -> executar(
                    "jpetstore.fn_realizar_pagamento(?, ?, 'CARTAO_CREDITO', ?)", usuario, pedido, cartaoAlheio));
            deveFalhar("JP422", "CARTAO_OBRIGATORIO", () -> executar(
                    "jpetstore.fn_realizar_pagamento(?, ?, 'CARTAO_CREDITO')", usuario, pedido));
        }

        @Test
        void pedidoDeOutroUsuarioNaoEEncontrado() {
            UUID pedido = novoPedido(novoUsuario(), "50.00");
            UUID outro = novoUsuario();

            deveFalhar("JP404", "PEDIDO_NAO_ENCONTRADO",
                    () -> executar("jpetstore.fn_realizar_pagamento(?, ?, 'PIX')", outro, pedido));
        }
    }

    @Nested
    class CupomPromocional {

        UUID inserir(String codigo, String percentual) {
            return valor("jpetstore.fn_inserir_cupom(?, ?::numeric, current_date + 30)", UUID.class, codigo, percentual);
        }

        @Test
        void codigoRepetidoSemDiferenciarMaiusculasERecusado() {
            String codigo = codigoUnico("DUP");
            inserir(codigo, "10");

            deveFalhar("JP409", "CUPOM_JA_EXISTE", () -> inserir(codigo.toLowerCase(), "15"));
        }

        @Test
        void percentualForaDoIntervaloOuValidadePassadaSaoRecusados() {
            deveFalhar("JP422", "CUPOM_INVALIDO", () -> inserir(codigoUnico("ZERO"), "0"));
            deveFalhar("JP422", "CUPOM_INVALIDO", () -> inserir(codigoUnico("MUITO"), "101"));
            deveFalhar("JP422", "CUPOM_INVALIDO", () -> valor(
                    "jpetstore.fn_inserir_cupom(?, 10, current_date - 1)", UUID.class, codigoUnico("VELHO")));
        }

        @Test
        void aplicarSemCarrinhoPrevioDescontaNoCarrinhoENoPedido() {
            // Regressão: aplicar o cupom antes de existir carrinho não era gravado.
            String codigo = codigoUnico("DEZ");
            inserir(codigo, "10");
            UUID usuario = novoUsuario();

            executar("jpetstore.fn_aplicar_cupom_carrinho(?, ?)", usuario, codigo.toLowerCase());
            var carrinho = jsonDe("jpetstore.fn_adicionar_item_carrinho(?, ?)", usuario, novoAnimal("200.00"));

            assertThat(carrinho.get("cupom").isNull()).as("cupom aplicado ao carrinho").isFalse();
            assertThat(carrinho.get("cupom").get("codigo").asString()).isEqualTo(codigo);
            assertThat(carrinho.get("desconto").decimalValue()).isEqualByComparingTo("20.00");
            assertThat(carrinho.get("total").decimalValue()).isEqualByComparingTo("180.00");

            UUID pedido = valor("jpetstore.fn_criar_pedido(?, 'RETIRADA')", UUID.class, usuario);
            var detalhe = jsonDe("jpetstore.fn_obter_pedido(?, ?)", usuario, pedido);
            assertThat(detalhe.get("cupom").asString()).isEqualTo(codigo);
            assertThat(detalhe.get("valorDesconto").decimalValue()).isEqualByComparingTo("20.00");
            assertThat(detalhe.get("valorTotal").decimalValue()).isEqualByComparingTo("180.00");
        }

        @Test
        void cupomInexistenteInativoOuVencidoERecusado() {
            UUID usuario = novoUsuario();
            String inativo = codigoUnico("OFF");
            inserir(inativo, "10");
            jdbc.update("update jpetstore.cupom set ativo = false where codigo = ?", inativo);
            String vencido = codigoUnico("VENC");
            jdbc.update("insert into jpetstore.cupom (codigo, percentual_desconto, data_validade) values (?, 10, current_date - 1)", vencido);

            deveFalhar("JP422", "CUPOM_INVALIDO", () -> executar("jpetstore.fn_aplicar_cupom_carrinho(?, ?)", usuario, "NAOEXISTE"));
            deveFalhar("JP422", "CUPOM_INVALIDO", () -> executar("jpetstore.fn_aplicar_cupom_carrinho(?, ?)", usuario, inativo));
            deveFalhar("JP422", "CUPOM_INVALIDO", () -> executar("jpetstore.fn_aplicar_cupom_carrinho(?, ?)", usuario, vencido));
        }

        @Test
        void removerCupomZeraODesconto() {
            String codigo = codigoUnico("REM");
            inserir(codigo, "50");
            UUID usuario = novoUsuario();
            executar("jpetstore.fn_adicionar_item_carrinho(?, ?)", usuario, novoAnimal("100.00"));
            executar("jpetstore.fn_aplicar_cupom_carrinho(?, ?)", usuario, codigo);

            var carrinho = jsonDe("jpetstore.fn_remover_cupom_carrinho(?)", usuario);

            assertThat(carrinho.get("cupom").isNull()).isTrue();
            assertThat(carrinho.get("desconto").decimalValue()).isEqualByComparingTo("0");
            assertThat(carrinho.get("total").decimalValue()).isEqualByComparingTo("100.00");
        }
    }

    @Nested
    class Enderecos {

        String endereco(String cidade, String cep) {
            return json.writeValueAsString(java.util.Map.of(
                    "rua", "Rua " + cidade, "numero", "1", "cidade", cidade, "estado", "SP", "cep", cep));
        }

        UUID cadastrar(UUID usuario, String cidade) {
            return valor("jpetstore.fn_cadastrar_endereco(?, ?::jsonb)", UUID.class, usuario, endereco(cidade, "01001-000"));
        }

        UUID cadastrarAlternativo(UUID usuario, String cidade) {
            return valor("jpetstore.fn_cadastrar_endereco_alternativo(?, ?::jsonb)", UUID.class, usuario, endereco(cidade, "01001000"));
        }

        /** Cidade do endereço principal do usuário. */
        String principal(UUID usuario) {
            var enderecos = jsonDe("jpetstore.fn_listar_enderecos(?)", usuario);
            String cidade = null;
            for (var e : enderecos) {
                if (e.get("principal").asBoolean()) {
                    assertThat(cidade).as("apenas um endereço principal").isNull();
                    cidade = e.get("cidade").asString();
                }
            }
            return cidade;
        }

        @Test
        void primeiroViraPrincipalEAlternativoNaoMudaOPrincipal() {
            UUID usuario = novoUsuario();
            cadastrar(usuario, "Recife");
            cadastrarAlternativo(usuario, "Olinda");

            assertThat(principal(usuario)).isEqualTo("Recife");
            assertThat(jsonDe("jpetstore.fn_listar_enderecos(?)", usuario)).hasSize(2);
        }

        @Test
        void alternativoComoPrimeiroEnderecoViraPrincipal() {
            UUID usuario = novoUsuario();
            cadastrarAlternativo(usuario, "Natal");

            assertThat(principal(usuario)).isEqualTo("Natal");
        }

        @Test
        void definirOutroPrincipalDesmarcaOAnterior() {
            UUID usuario = novoUsuario();
            cadastrar(usuario, "Recife");
            UUID olinda = cadastrarAlternativo(usuario, "Olinda");

            executar("jpetstore.fn_definir_endereco_principal(?, ?)", usuario, olinda);

            assertThat(principal(usuario)).isEqualTo("Olinda");
        }

        @Test
        void removerOPrincipalPromoveOMaisRecente() {
            UUID usuario = novoUsuario();
            UUID recife = cadastrar(usuario, "Recife");
            cadastrarAlternativo(usuario, "Olinda");
            cadastrarAlternativo(usuario, "Paulista");

            executar("jpetstore.fn_remover_endereco(?, ?)", usuario, recife);

            assertThat(principal(usuario)).isEqualTo("Paulista");
        }

        @Test
        void editarAlteraOsDados() {
            UUID usuario = novoUsuario();
            UUID id = cadastrar(usuario, "Recife");

            var editado = jsonDe("jpetstore.fn_editar_endereco(?, ?, ?::jsonb)", usuario, id, endereco("Caruaru", "55000-000"));

            assertThat(editado.get("cidade").asString()).isEqualTo("Caruaru");
            assertThat(editado.get("cep").asString()).isEqualTo("55000000");
            assertThat(editado.get("principal").asBoolean()).isTrue();
        }

        @Test
        void enderecoDeOutroUsuarioNaoEEncontrado() {
            UUID dono = novoUsuario();
            UUID id = cadastrar(dono, "Recife");
            UUID outro = novoUsuario();

            deveFalhar("JP404", "ENDERECO_NAO_ENCONTRADO",
                    () -> executar("jpetstore.fn_editar_endereco(?, ?, ?::jsonb)", outro, id, endereco("X", "01001000")));
            deveFalhar("JP404", "ENDERECO_NAO_ENCONTRADO",
                    () -> executar("jpetstore.fn_remover_endereco(?, ?)", outro, id));
            deveFalhar("JP404", "ENDERECO_NAO_ENCONTRADO",
                    () -> executar("jpetstore.fn_definir_endereco_principal(?, ?)", outro, id));
        }

        @Test
        void cepSemOitoDigitosERecusado() {
            UUID usuario = novoUsuario();
            deveFalhar("JP422", "ENDERECO_INVALIDO",
                    () -> valor("jpetstore.fn_cadastrar_endereco(?, ?::jsonb)", UUID.class, usuario, endereco("Recife", "1234")));
        }
    }
}
