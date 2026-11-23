import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Especie } from "../services/animais";
import { buscarTags, cadastrarRaca, listarRacas, listarValoresUsados, obterAnimal, salvarAnimal } from "../services/adminAnimais";
import type { AnimalAdmin, DadosAnimal, Raca } from "../services/adminAnimais";
import { mensagemDeErro, naoAutenticado, urlDoArquivo } from "../services/api";
import { codigoDoRotulo } from "../services/rotulosAnimal";
import type { Rotulos } from "../services/rotulosAnimal";

const MB = 1024 * 1024;
const TIPOS_DE_IMAGEM = ["image/jpeg", "image/png", "image/webp"];

interface Opcoes {
    especie: Especie;
    /** Campos próprios da espécie, com os nomes usados pela API. */
    camposDaEspecie: string[];
    /** Campos que a API recebe em código (ex.: PEQUENO) e a tela mostra em texto. */
    rotulos?: Record<string, Rotulos>;
    /** Tamanho máximo do laudo na tela. */
    laudoMaximoMb: number;
}

/** Campos de texto da tela que a API recebe como número. */
const CAMPOS_NUMERICOS = ["altura", "peso"];

/** "2021-04-20" -> "20/04/2021" */
function dataParaTela(data: string | null): string {
    return data ? data.split("-").reverse().join("/") : "";
}

/** "20/04/2021" ou "20 / 04 / 2021" -> "2021-04-20"; null se a data não existir. */
function dataParaApi(texto: string): string | null {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.replace(/\s/g, ""));
    if (!partes) return null;
    const iso = `${partes[3]}-${partes[2]}-${partes[1]}`;
    const data = new Date(`${iso}T00:00:00Z`);
    return !Number.isNaN(data.getTime()) && data.toISOString().startsWith(iso) ? iso : null;
}

/** "12,5" -> "12.5"; null se não for um número. */
function numeroParaApi(texto: string): string | null {
    const numero = texto.trim().replace(",", ".");
    return numero !== "" && Number.isFinite(Number(numero)) ? numero : null;
}

/**
 * Comunicação das telas de cadastro de animal com a API (RF23, RF24, RF27).
 * Com :id na rota, carrega e edita o animal. O visual fica em cada tela.
 */
export function useCadastroAnimal({ especie, camposDaEspecie, rotulos = {}, laudoMaximoMb }: Opcoes) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [animal, setAnimal] = useState<AnimalAdmin | null>(null);
    const [carregando, setCarregando] = useState(Boolean(id));
    const salvando = useRef(false); // evita salvar duas vezes com cliques seguidos

    const [campos, setCampos] = useState<Record<string, string>>({});
    const [racas, setRacas] = useState<Raca[]>([]);
    const [valoresUsados, setValoresUsados] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const [arquivoPrincipal, setArquivoPrincipal] = useState<File | null>(null);
    const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);
    const [fotos, setFotos] = useState<(File | null)[]>([null, null, null]);
    const [laudo, setLaudo] = useState<File | null>(null);

    useEffect(() => {
        let ativo = true;
        Promise.all([listarRacas(especie), listarValoresUsados(especie), id ? obterAnimal(id) : null])
            .then(([listaDeRacas, valores, encontrado]) => {
                if (!ativo) return;
                setRacas(listaDeRacas);
                setValoresUsados(valores);
                if (encontrado) {
                    const atributos = Object.entries(encontrado.atributos).map(([campo, valor]) => [
                        campo, valor === null ? "" : rotulos[campo]?.[String(valor)] ?? String(valor)
                    ]);
                    const capa = encontrado.galeria.find((imagem) => imagem.principal);
                    setAnimal(encontrado);
                    setCampos({
                        ...Object.fromEntries(atributos),
                        nome: encontrado.nome,
                        raca: encontrado.raca.nome,
                        preco: String(encontrado.preco),
                        nascimento: dataParaTela(encontrado.dataNascimento),
                        descricao: encontrado.descricao ?? ""
                    });
                    setTags(encontrado.tags);
                    setImagemPrincipal(capa ? urlDoArquivo(capa.url) : null);
                }
                setCarregando(false);
            })
            .catch((e) => {
                if (!ativo) return;
                if (naoAutenticado(e)) navigate("/login");
                else alert(mensagemDeErro(e));
            });
        return () => { ativo = false; };
        // "rotulos" é fixo em cada tela.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [especie, id, navigate]);

    const fotosSalvas = (animal?.galeria ?? []).filter((foto) => !foto.principal);
    const campo = (nome: string): string => campos[nome] ?? "";
    const mudar = (nome: string) => (valor: string): void => setCampos((atuais) => ({ ...atuais, [nome]: valor }));

    /** RF24 — cadastra a raça (ou usa a existente) e a seleciona. Devolve false se falhar. */
    async function adicionarRaca(nome: string): Promise<boolean> {
        const existente = racas.find((raca) => raca.nome.toLowerCase() === nome.toLowerCase());
        try {
            const raca = existente ?? await cadastrarRaca(especie, nome);
            if (!existente) setRacas((atuais) => [...atuais, raca].sort((a, b) => a.nome.localeCompare(b.nome)));
            mudar("raca")(raca.nome);
            return true;
        } catch (e) {
            if (naoAutenticado(e)) navigate("/login");
            else alert(mensagemDeErro(e));
            return false;
        }
    }

    /** Lê o arquivo escolhido e limpa o campo, para permitir escolher o mesmo de novo. */
    function arquivoDe(e: ChangeEvent<HTMLInputElement>): File | undefined {
        const arquivo = e.target.files?.[0];
        e.target.value = "";
        return arquivo;
    }

    function imagemValida(arquivo: File): boolean {
        if (!TIPOS_DE_IMAGEM.includes(arquivo.type)) alert("A imagem precisa ser JPEG, PNG ou WebP.");
        else if (arquivo.size > 2 * MB) alert("Cada imagem pode ter no máximo 2MB.");
        else return true;
        return false;
    }

    function escolherPrincipal(e: ChangeEvent<HTMLInputElement>): void {
        const arquivo = arquivoDe(e);
        if (!arquivo || !imagemValida(arquivo)) return;
        setArquivoPrincipal(arquivo);
        setImagemPrincipal(URL.createObjectURL(arquivo));
    }

    function escolherFoto(indice: number, e: ChangeEvent<HTMLInputElement>): void {
        const arquivo = arquivoDe(e);
        if (!arquivo || !imagemValida(arquivo)) return;
        setFotos((atuais) => atuais.map((foto, i) => (i === indice ? arquivo : foto)));
    }

    function escolherLaudo(e: ChangeEvent<HTMLInputElement>): void {
        const arquivo = arquivoDe(e);
        if (!arquivo) return;
        if (arquivo.type !== "application/pdf") alert("O laudo precisa ser um PDF.");
        else if (arquivo.size > laudoMaximoMb * MB) alert(`O arquivo PDF deve ter no máximo ${laudoMaximoMb}MB.`);
        else setLaudo(arquivo);
    }

    /** Valores dos campos da espécie no formato da API; lança o aviso a mostrar se algum não servir. */
    function atributosParaApi(): Record<string, string | null> {
        return Object.fromEntries(camposDaEspecie.map((nome) => {
            const texto = campo(nome).trim();
            if (!texto) return [nome, null];

            if (CAMPOS_NUMERICOS.includes(nome)) {
                const numero = numeroParaApi(texto);
                if (!numero) throw new Error(`O campo ${nome} precisa ser um número (${nome === "altura" ? "cm" : "kg"}).`);
                return [nome, numero];
            }

            const tabela = rotulos[nome];
            const jaEstavaSalvo = texto === String(animal?.atributos[nome]);
            if (tabela && !jaEstavaSalvo && !Object.values(tabela).includes(texto)) {
                throw new Error(`"${texto}" ainda não é aceito pelo sistema.`);
            }
            return [nome, codigoDoRotulo(tabela, texto)];
        }));
    }

    /** Monta os dados da tela; lança o aviso a mostrar se algum campo não servir. */
    function dadosDaTela(): DadosAnimal {
        const raca = racas.find((item) => item.nome === campo("raca"));
        const preco = numeroParaApi(campo("preco"));
        const nascimento = dataParaApi(campo("nascimento"));
        if (!campo("nome").trim()) throw new Error("Informe o nome do animal.");
        if (!raca) throw new Error("Selecione a raça ou espécie do animal.");
        if (!preco) throw new Error("Informe o preço do animal (ex.: 1500,00).");
        if (campo("nascimento").trim() && !nascimento) throw new Error("Informe o nascimento no formato 00/00/0000.");

        return {
            // Campos sem lugar na tela (ex.: porte do gato, sexo) são devolvidos como estavam.
            ...animal?.atributos,
            ...atributosParaApi(),
            especie,
            racaId: raca.id,
            nome: campo("nome").trim(),
            preco,
            dataNascimento: nascimento,
            descricao: campo("descricao").trim() || null,
            sexo: animal?.sexo ?? null,
            tags,
            // Escolher uma foto no lugar de outra já salva substitui a anterior.
            imagensRemovidas: fotosSalvas.filter((_, i) => fotos[i]).map((foto) => foto.id),
            laudosRemovidos: []
        };
    }

    /** RF23 / RF27 — devolve true se salvou; senão, o motivo já foi mostrado. */
    async function salvar(): Promise<boolean> {
        if (salvando.current || carregando) return false;
        let dados: DadosAnimal;
        try {
            dados = dadosDaTela();
        } catch (e) {
            alert((e as Error).message);
            return false;
        }

        salvando.current = true;
        try {
            await salvarAnimal(id, dados, {
                imagemPrincipal: arquivoPrincipal,
                fotos: fotos.filter((foto) => foto !== null),
                laudos: laudo ? [laudo] : []
            });
            return true;
        } catch (e) {
            if (naoAutenticado(e)) navigate("/login");
            else alert(mensagemDeErro(e));
            return false;
        } finally {
            salvando.current = false;
        }
    }

    return {
        campo,
        mudar,
        racas: racas.map((raca) => raca.nome),
        /** Valores já cadastrados no campo de texto livre da espécie (ex.: plumagem). */
        valoresUsados,
        adicionarRaca,
        tags,
        setTags,
        imagemPrincipal,
        nomeLaudo: laudo?.name ?? "",
        nomesDasFotos: fotos.map((foto, i) => foto?.name ?? (fotosSalvas[i] ? `Foto ${i + 1} salva` : null)),
        escolherPrincipal,
        escolherFoto,
        escolherLaudo,
        salvar
    };
}

/** RF17 — junta as sugestões da tela com as tags já cadastradas que combinam com a busca. */
export function useSugestoesDeTags(busca: string, sugeridas: string[]): string[] {
    const termo = busca.trim().toLowerCase();
    const [resultado, setResultado] = useState<{ termo: string; tags: string[] }>({ termo: "", tags: [] });

    useEffect(() => {
        if (!termo) return;
        let ativo = true;
        const espera = setTimeout(() => {
            buscarTags(termo)
                .then((tags) => ativo && setResultado({ termo, tags }))
                .catch(() => ativo && setResultado({ termo, tags: [] })); // ainda dá para digitar a tag
        }, 250);
        return () => {
            ativo = false;
            clearTimeout(espera);
        };
    }, [termo]);

    const daTela = sugeridas.filter((tag) => tag.toLowerCase().includes(termo));
    const doBanco = resultado.termo === termo ? resultado.tags : [];
    const novas = doBanco.filter((tag) => !daTela.some((outra) => outra.toLowerCase() === tag.toLowerCase()));
    return [...daTela, ...novas];
}
