package br.com.jpetstore.backend.animal.dto;

import java.util.List;

public record Pagina<T>(List<T> conteudo, int pagina, int tamanho, long totalElementos, int totalPaginas) {
}
