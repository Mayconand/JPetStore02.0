package br.com.jpetstore.backend.admin;

import br.com.jpetstore.backend.admin.dto.AcessoAdmin;
import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.enums.PapelEnum;
import br.com.jpetstore.backend.usuario.Credenciais;
import br.com.jpetstore.backend.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * RNF05 — além da regra de rota (/api/admin/** exige ADMIN no token), confere o
 * Papel atual no banco: um token emitido antes de o Usuário perder o Papel ADMIN
 * não dá mais acesso.
 */
@Service
public class AdminService {

    private final UsuarioRepository usuarios;

    public AdminService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    public AcessoAdmin verificarAcesso(UUID usuarioId) {
        Credenciais admin = usuarios.buscarCredenciaisPorId(usuarioId)
                .filter(u -> u.papel() == PapelEnum.ADMIN)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "ACESSO_NEGADO",
                        "Você não tem permissão para acessar este recurso."));
        return new AcessoAdmin(true, admin.id(), admin.nome());
    }
}
