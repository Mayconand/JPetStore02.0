package br.com.jpetstore.backend.pedido.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import br.com.jpetstore.backend.comum.DadosEndereco;

import java.util.UUID;

/** Pagamento de demonstração: nenhuma instituição financeira é acionada. */
public record RealizarPagamentoRequest(@NotNull Forma forma, UUID cartaoId, @Valid DadosEndereco enderecoCobranca) {
    public enum Forma {
        CARTAO_CREDITO, PIX, BOLETO
    }
}
