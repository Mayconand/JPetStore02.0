package br.com.jpetstore.backend.animal.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.enums.SexoEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** RF16 — Dados detalhados, fotos, tags, laudos e cuidados do animal. */
public record AnimalResponse(
        UUID id, String nome, EspecieEnum especie, Raca raca,
        LocalDate dataNascimento, SexoEnum sexo, boolean castrado,
        String descricao, BigDecimal preco, boolean disponivel, String cuidados,
        Map<String, Object> atributos, List<String> imagens, List<String> tags, List<Laudo> laudos) {

    public record Raca(UUID id, String nome, String descricao) {
    }

    public record Laudo(UUID id, String titulo, String descricao, LocalDate dataEmissao, String arquivoUrl) {
    }
}
