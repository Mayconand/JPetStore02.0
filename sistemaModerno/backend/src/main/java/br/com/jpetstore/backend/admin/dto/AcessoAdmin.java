package br.com.jpetstore.backend.admin.dto;

import java.util.UUID;

public record AcessoAdmin(boolean autorizado, UUID usuarioId, String nome) {
}
