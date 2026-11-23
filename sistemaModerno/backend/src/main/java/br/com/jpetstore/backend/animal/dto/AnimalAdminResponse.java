package br.com.jpetstore.backend.animal.dto;

import br.com.jpetstore.backend.enums.EspecieEnum;
import br.com.jpetstore.backend.enums.SexoEnum;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Ficha do animal para edição: traz os ids das imagens, com a principal primeiro. */
public record AnimalAdminResponse(
        UUID id, String nome, EspecieEnum especie, AnimalResponse.Raca raca,
        LocalDate dataNascimento, SexoEnum sexo, boolean castrado,
        String descricao, BigDecimal preco, boolean disponivel,
        Map<String, Object> atributos, List<Imagem> galeria, List<String> tags, List<AnimalResponse.Laudo> laudos) {

    public record Imagem(UUID id, String url, boolean principal) {
    }
}
