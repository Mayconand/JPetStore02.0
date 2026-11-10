package br.com.jpetstore.backend.admin;

import br.com.jpetstore.backend.admin.dto.AcessoAdmin;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
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

    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    /** Permite ao frontend confirmar se o usuário logado pode acessar a área administrativa. */
    @GetMapping("/acesso")
    public AcessoAdmin acesso(@AuthenticationPrincipal Jwt jwt) {
        return service.verificarAcesso(UsuarioAutenticado.id(jwt));
    }
}
