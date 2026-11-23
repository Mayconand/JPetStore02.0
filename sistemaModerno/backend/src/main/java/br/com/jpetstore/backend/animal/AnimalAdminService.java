package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.admin.AdminService;
import br.com.jpetstore.backend.animal.dto.AnimalAdminResponse;
import br.com.jpetstore.backend.animal.dto.AnimalAdminResumo;
import br.com.jpetstore.backend.animal.dto.AnimalResponse;
import br.com.jpetstore.backend.animal.dto.SalvarAnimalRequest;
import br.com.jpetstore.backend.arquivo.Arquivo;
import br.com.jpetstore.backend.arquivo.ArquivoRepository;
import br.com.jpetstore.backend.arquivo.LeitorDeArquivos;
import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.Pagina;
import br.com.jpetstore.backend.enums.EspecieEnum;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/** RF23, RF26, RF27 e RF28 — administração de animais. Dados e arquivos são salvos juntos: ou tudo, ou nada. */
@Service
public class AnimalAdminService {

    /** Arquivos enviados no formulário. Todos opcionais. */
    public record ArquivosEnviados(MultipartFile imagemPrincipal, List<MultipartFile> fotos, List<MultipartFile> laudos) {
    }

    /** Os mesmos arquivos, já lidos e validados. */
    private record ArquivosValidados(List<Arquivo> imagemPrincipal, List<Arquivo> fotos, List<Arquivo> laudos) {
    }

    private final AnimalAdminRepository repository;
    private final ArquivoRepository arquivos;
    private final AdminService admins;

    public AnimalAdminService(AnimalAdminRepository repository, ArquivoRepository arquivos,
                              AdminService admins) {
        this.repository = repository;
        this.arquivos = arquivos;
        this.admins = admins;
    }

    /** Página começa em 0. */
    public Pagina<AnimalAdminResumo> listar(UUID usuarioId, String termo, String especie, UUID racaId,
                                            Boolean disponivel, String atributo, int pagina, int tamanho) {
        admins.verificarAcesso(usuarioId);
        int paginaValida = Math.max(pagina, 0);
        int tamanhoValido = Math.clamp(tamanho, 1, AnimalService.TAMANHO_MAXIMO);
        AnimalAdminRepository.ResultadoListagem resultado = repository.listar(
                termo, especie, racaId, disponivel, atributo, tamanhoValido, paginaValida * tamanhoValido);
        int totalPaginas = (int) Math.ceil((double) resultado.total() / tamanhoValido);
        return new Pagina<>(resultado.animais(), paginaValida, tamanhoValido, resultado.total(), totalPaginas);
    }

    public AnimalAdminResponse obter(UUID usuarioId, UUID id) {
        admins.verificarAcesso(usuarioId);
        return repository.obter(id);
    }

    /** Opções já usadas na espécie, para os formulários e filtros do painel. */
    public List<String> valoresUsados(UUID usuarioId, EspecieEnum especie) {
        admins.verificarAcesso(usuarioId);
        return repository.valoresUsados(especie);
    }

    public List<AnimalResponse.Laudo> listarLaudos(UUID usuarioId, UUID id) {
        return obter(usuarioId, id).laudos();
    }

    @Transactional
    public AnimalAdminResponse cadastrar(UUID usuarioId, SalvarAnimalRequest dados, ArquivosEnviados enviados) {
        admins.verificarAcesso(usuarioId);
        if (dados.especie() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ESPECIE_OBRIGATORIA", "Informe a espécie do animal.");
        }
        ArquivosValidados validados = validar(enviados);
        UUID id = repository.cadastrar(dados.especie(), paraBanco(dados));
        salvarArquivos(id, validados);
        return repository.obter(id);
    }

    @Transactional
    public AnimalAdminResponse editar(UUID usuarioId, UUID id, SalvarAnimalRequest dados, ArquivosEnviados enviados) {
        admins.verificarAcesso(usuarioId);
        if (dados.especie() != null && dados.especie() != repository.obter(id).especie()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_CONTENT, "ESPECIE_NAO_PODE_MUDAR",
                    "A espécie de um animal cadastrado não pode ser alterada.");
        }
        ArquivosValidados validados = validar(enviados);
        repository.editar(id, paraBanco(dados));
        // Remove antes de adicionar: permite trocar uma foto quando a galeria está cheia.
        lista(dados.imagensRemovidas()).forEach(imagemId -> arquivos.removerImagem(id, imagemId));
        lista(dados.laudosRemovidos()).forEach(laudoId -> arquivos.removerLaudo(id, laudoId));
        salvarArquivos(id, validados);
        return repository.obter(id);
    }

    public void excluir(UUID usuarioId, UUID id) {
        admins.verificarAcesso(usuarioId);
        repository.excluir(id);
    }

    private void salvarArquivos(UUID animalId, ArquivosValidados validados) {
        validados.imagemPrincipal().forEach(imagem -> arquivos.adicionarImagem(animalId, true, imagem));
        validados.fotos().forEach(foto -> arquivos.adicionarImagem(animalId, false, foto));
        validados.laudos().forEach(laudo -> arquivos.adicionarLaudo(animalId, laudo));
    }

    private static ArquivosValidados validar(ArquivosEnviados enviados) {
        List<MultipartFile> principal = enviados.imagemPrincipal() == null ? List.of() : List.of(enviados.imagemPrincipal());
        return new ArquivosValidados(
                ler(principal, LeitorDeArquivos::imagem),
                ler(enviados.fotos(), LeitorDeArquivos::imagem),
                ler(enviados.laudos(), LeitorDeArquivos::laudo));
    }

    /** Campos de arquivo deixados vazios no formulário chegam com 0 bytes e são ignorados. */
    private static List<Arquivo> ler(List<MultipartFile> enviados, Function<MultipartFile, Arquivo> leitor) {
        return lista(enviados).stream().filter(enviado -> !enviado.isEmpty()).map(leitor).toList();
    }

    private static <T> List<T> lista(List<T> valores) {
        return valores == null ? List.of() : valores;
    }

    /** Formato de p_dados em fn_cadastrar_animal / fn_editar_animal (chave ausente = não altera). */
    private static Map<String, Object> paraBanco(SalvarAnimalRequest dados) {
        Map<String, Object> banco = new LinkedHashMap<>();
        banco.put("racaId", dados.racaId());
        banco.put("nome", dados.nome());
        banco.put("preco", dados.preco());
        banco.put("dataNascimento", dados.dataNascimento());
        banco.put("descricao", dados.descricao());
        banco.put("sexo", dados.sexo());
        banco.put("altura", dados.altura());
        banco.put("peso", dados.peso());
        banco.put("porte", dados.porte());
        banco.put("pelagem", dados.pelagem());
        banco.put("plumagem", dados.plumagem());
        banco.put("tipoDeAgua", dados.tipoDeAgua());
        banco.put("estirpe", dados.estirpe());
        banco.put("ph", dados.ph());
        banco.put("expectativaDeVida", dados.expectativaDeVida());
        banco.put("grupo", dados.grupo());
        banco.put("mutacao", dados.mutacao());
        if (dados.castrado() != null) {
            banco.put("castrado", dados.castrado());
        }
        if (dados.disponivel() != null) {
            banco.put("disponivel", dados.disponivel());
        }
        if (dados.tags() != null) {
            banco.put("tags", dados.tags());
        }
        return banco;
    }
}
