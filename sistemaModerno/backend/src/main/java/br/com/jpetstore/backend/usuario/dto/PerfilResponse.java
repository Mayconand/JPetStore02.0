package br.com.jpetstore.backend.usuario.dto;

import br.com.jpetstore.backend.enums.IdiomaEnum;
import br.com.jpetstore.backend.enums.PapelEnum;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PerfilResponse(
        UUID id,
        String nome,
        String sobrenome,
        String email,
        String telefone,
        PapelEnum papel,
        IdiomaEnum idiomaPreferencial,
        Map<String, Object> preferencias,
        List<EnderecoResponse> enderecos) {
}
