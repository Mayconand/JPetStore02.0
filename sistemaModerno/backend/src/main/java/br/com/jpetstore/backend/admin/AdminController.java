package br.com.jpetstore.backend.admin;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * RNF05 — Controle de Acesso Administrativo.
 * Tudo sob /api/admin/** exige papel ADMIN (ver SegurancaConfig). As
 * funcionalidades administrativas (RF23–RF30) devem ser criadas neste prefixo.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    /** Permite ao frontend confirmar se o usuário logado pode acessar a área administrativa. */
    @GetMapping("/acesso")
    public AcessoAdmin acesso(@AuthenticationPrincipal Jwt jwt) {
        return new AcessoAdmin(true, jwt.getSubject(), jwt.getClaimAsString("nome"));
    }

    public record AcessoAdmin(boolean autorizado, String usuarioId, String nome) {
    }
}
