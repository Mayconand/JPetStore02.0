package br.com.jpetstore.backend.arquivo;

import br.com.jpetstore.backend.comum.ApiException;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@RestController
public class ArquivoController {

    private final ArquivoRepository repository;

    public ArquivoController(ArquivoRepository repository) {
        this.repository = repository;
    }

    /** Foto do animal (pública). O conteúdo de um id nunca muda, então pode ficar em cache. */
    @GetMapping("/api/animais/imagens/{id}")
    public ResponseEntity<byte[]> imagem(@PathVariable UUID id) {
        return resposta(repository.obterImagem(id), CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable());
    }

    /** RF26 — PDF do laudo (exige login). */
    @GetMapping("/api/laudos/{id}/arquivo")
    public ResponseEntity<byte[]> laudo(@PathVariable UUID id) {
        return resposta(repository.obterLaudo(id), CacheControl.noStore());
    }

    private ResponseEntity<byte[]> resposta(Optional<Arquivo> encontrado, CacheControl cache) {
        Arquivo arquivo = encontrado.orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "ARQUIVO_NAO_ENCONTRADO", "Arquivo não encontrado."));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(arquivo.tipoConteudo()))
                .cacheControl(cache)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                        .filename(arquivo.nome(), StandardCharsets.UTF_8).build().toString())
                .body(arquivo.conteudo());
    }
}
