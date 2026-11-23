package br.com.jpetstore.backend.arquivo;

import br.com.jpetstore.backend.comum.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

/**
 * Lê e valida os arquivos enviados. O tipo é descoberto pelos primeiros bytes do
 * conteúdo: a extensão e o Content-Type vêm do cliente e não são confiáveis.
 */
public final class LeitorDeArquivos {

    private static final int MB = 1024 * 1024;
    private static final int IMAGEM_MAX_MB = 2;
    private static final int LAUDO_MAX_MB = 10;
    private static final int NOME_MAX = 120;

    private LeitorDeArquivos() {
    }

    /** JPEG, PNG ou WebP de até 2 MB. */
    public static Arquivo imagem(MultipartFile enviado) {
        byte[] conteudo = ler(enviado, IMAGEM_MAX_MB);
        String tipo = tipoDaImagem(conteudo);
        if (tipo == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "IMAGEM_INVALIDA",
                    "A imagem precisa ser JPEG, PNG ou WebP.");
        }
        return new Arquivo(nome(enviado, "imagem"), tipo, conteudo);
    }

    /** PDF de até 10 MB. */
    public static Arquivo laudo(MultipartFile enviado) {
        byte[] conteudo = ler(enviado, LAUDO_MAX_MB);
        if (!textoEm(conteudo, 0, "%PDF-")) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "LAUDO_INVALIDO", "O laudo precisa ser um PDF.");
        }
        return new Arquivo(nome(enviado, "laudo.pdf"), MediaType.APPLICATION_PDF_VALUE, conteudo);
    }

    private static byte[] ler(MultipartFile enviado, int maximoMb) {
        if (enviado.getSize() > (long) maximoMb * MB) {
            throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, "ARQUIVO_MUITO_GRANDE",
                    "O arquivo \"" + nome(enviado, "enviado") + "\" passa do limite de " + maximoMb + " MB.");
        }
        try {
            return enviado.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static String tipoDaImagem(byte[] c) {
        if (c.length > 3 && (c[0] & 0xFF) == 0xFF && (c[1] & 0xFF) == 0xD8 && (c[2] & 0xFF) == 0xFF) {
            return MediaType.IMAGE_JPEG_VALUE;
        }
        if (c.length > 8 && (c[0] & 0xFF) == 0x89 && textoEm(c, 1, "PNG\r\n\u001A\n")) {
            return MediaType.IMAGE_PNG_VALUE;
        }
        return textoEm(c, 0, "RIFF") && textoEm(c, 8, "WEBP") ? "image/webp" : null;
    }

    private static boolean textoEm(byte[] conteudo, int posicao, String esperado) {
        return conteudo.length >= posicao + esperado.length()
                && new String(conteudo, posicao, esperado.length(), StandardCharsets.ISO_8859_1).equals(esperado);
    }

    /** Só o nome do arquivo, sem pastas nem caracteres de controle. */
    private static String nome(MultipartFile enviado, String padrao) {
        String original = enviado.getOriginalFilename() == null ? "" : enviado.getOriginalFilename();
        String nome = original.substring(Math.max(original.lastIndexOf('/'), original.lastIndexOf('\\')) + 1)
                .replaceAll("\\p{Cntrl}", "").strip();
        if (nome.isEmpty()) {
            return padrao;
        }
        return nome.length() > NOME_MAX ? nome.substring(nome.length() - NOME_MAX).strip() : nome;
    }
}
