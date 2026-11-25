package br.com.jpetstore.backend.admin;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/cupons")
public class CupomAdminController {
    private final AdminService admins;
    private final FuncoesBanco banco;

    public CupomAdminController(AdminService admins, FuncoesBanco banco) {
        this.admins = admins;
        this.banco = banco;
    }

    public record NovoCupom(
            @NotBlank @Size(max = 64) String codigo,
            @NotNull @DecimalMin("0.01") @DecimalMax("100") @Digits(integer = 3, fraction = 2) BigDecimal percentual,
            @NotNull LocalDate dataValidade) { }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, UUID> criar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody NovoCupom dados) {
        admins.verificarAcesso(UsuarioAutenticado.id(jwt));
        try {
            UUID id = banco.valor("jpetstore.fn_inserir_cupom(?, ?, ?)", UUID.class,
                    dados.codigo(), dados.percentual(), dados.dataValidade());
            return Map.of("id", id);
        } catch (DuplicateKeyException erro) {
            throw new ApiException(HttpStatus.CONFLICT, "CUPOM_JA_EXISTE", "Este código de cupom já existe.");
        }
    }
}
