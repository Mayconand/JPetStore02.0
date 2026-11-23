package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.AnimalAdminService.ArquivosEnviados;
import br.com.jpetstore.backend.animal.dto.AnimalAdminResponse;
import br.com.jpetstore.backend.animal.dto.AnimalAdminResumo;
import br.com.jpetstore.backend.animal.dto.AnimalResponse;
import br.com.jpetstore.backend.animal.dto.SalvarAnimalRequest;
import br.com.jpetstore.backend.comum.Pagina;
import br.com.jpetstore.backend.comum.UsuarioAutenticado;
import br.com.jpetstore.backend.enums.EspecieEnum;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/** Administração de animais. Cadastro e edição são multipart: "dados" (JSON) e os arquivos. */
@RestController
@RequestMapping("/api/admin/animais")
public class AnimalAdminController {

    private final AnimalAdminService service;

    public AnimalAdminController(AnimalAdminService service) {
        this.service = service;
    }

    /** atributo: porte, pelagem, plumagem, tipo de água ou grupo, conforme a espécie. */
    @GetMapping
    public Pagina<AnimalAdminResumo> listar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) String especie,
            @RequestParam(required = false) UUID racaId,
            @RequestParam(required = false) Boolean disponivel,
            @RequestParam(required = false) String atributo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return service.listar(UsuarioAutenticado.id(jwt), termo, especie, racaId, disponivel, atributo, page, size);
    }

    /** Valores já usados no campo de texto livre da espécie (pelagem, plumagem, estirpe ou mutação). */
    @GetMapping("/valores")
    public List<String> valoresUsados(@AuthenticationPrincipal Jwt jwt, @RequestParam EspecieEnum especie) {
        return service.valoresUsados(UsuarioAutenticado.id(jwt), especie);
    }

    @GetMapping("/{id}")
    public AnimalAdminResponse obter(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.obter(UsuarioAutenticado.id(jwt), id);
    }

    /** RF26 — Ver Laudos. */
    @GetMapping("/{id}/laudos")
    public List<AnimalResponse.Laudo> listarLaudos(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return service.listarLaudos(UsuarioAutenticado.id(jwt), id);
    }

    /** RF23 — Cadastrar Animal. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AnimalAdminResponse cadastrar(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestPart("dados") SalvarAnimalRequest dados,
            @RequestPart(required = false) MultipartFile imagemPrincipal,
            @RequestPart(required = false) List<MultipartFile> fotos,
            @RequestPart(required = false) List<MultipartFile> laudos) {
        return service.cadastrar(UsuarioAutenticado.id(jwt), dados, new ArquivosEnviados(imagemPrincipal, fotos, laudos));
    }

    /** RF27 — Editar Animais. A imagem principal enviada substitui a atual; fotos e laudos são acrescentados. */
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AnimalAdminResponse editar(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestPart("dados") SalvarAnimalRequest dados,
            @RequestPart(required = false) MultipartFile imagemPrincipal,
            @RequestPart(required = false) List<MultipartFile> fotos,
            @RequestPart(required = false) List<MultipartFile> laudos) {
        return service.editar(UsuarioAutenticado.id(jwt), id, dados, new ArquivosEnviados(imagemPrincipal, fotos, laudos));
    }

    /** RF28 — Excluir Animais (recusado se o animal já fez parte de um pedido). */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        service.excluir(UsuarioAutenticado.id(jwt), id);
    }
}
