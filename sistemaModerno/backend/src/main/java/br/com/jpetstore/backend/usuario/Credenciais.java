package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.enums.PapelEnum;

import java.util.UUID;

/** O necessário para autenticar e autorizar um Usuário: identidade, hash da senha e Papel. */
public record Credenciais(UUID id, String nome, String email, String senhaHash, PapelEnum papel) {
}
