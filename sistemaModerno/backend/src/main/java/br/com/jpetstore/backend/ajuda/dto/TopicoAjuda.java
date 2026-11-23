package br.com.jpetstore.backend.ajuda.dto;

import java.util.UUID;

public record TopicoAjuda(UUID id, String titulo, String conteudo) {
}
