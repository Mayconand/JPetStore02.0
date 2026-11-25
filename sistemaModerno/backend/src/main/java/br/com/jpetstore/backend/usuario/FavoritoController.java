package br.com.jpetstore.backend.usuario;

import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.enums.EspecieEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios/me/favoritos")
public class FavoritoController {
    private final FuncoesBanco banco;

    public FavoritoController(FuncoesBanco banco) {
        this.banco = banco;
    }

    public record Favorito(UUID id, EspecieEnum especie, String raca) { }

    public record SalvarFavorito(@NotNull EspecieEnum especie, @NotBlank @Size(max = 120) String raca) { }

    @GetMapping
    public List<Favorito> listar(@AuthenticationPrincipal Jwt jwt) {
        return banco.linhas("""
                (select id, especie, raca from jpetstore.favorito
                 where usuario_id = ? order by criado_em, id) favoritos
                """, (rs, linha) -> new Favorito(rs.getObject("id", UUID.class),
                EspecieEnum.valueOf(rs.getString("especie")), rs.getString("raca")), UsuarioAutenticado.id(jwt));
    }

    @PutMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void incluir(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SalvarFavorito dados) {
        banco.alterar("""
                insert into jpetstore.favorito (usuario_id, especie, raca)
                values (?, ?, ?) on conflict (usuario_id, especie, raca) do nothing
                """, UsuarioAutenticado.id(jwt), dados.especie().name(), dados.raca().strip());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        banco.alterar("delete from jpetstore.favorito where usuario_id = ? and id = ?", UsuarioAutenticado.id(jwt), id);
    }
}
