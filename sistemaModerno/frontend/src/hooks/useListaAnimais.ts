import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Especie } from "../services/animais";
import { excluirAnimal, listarAnimais, listarLaudos, listarValoresUsados } from "../services/adminAnimais";
import type { AnimalAdminResumo } from "../services/adminAnimais";
import { mensagemDeErro, naoAutenticado } from "../services/api";
import { abrirLaudo } from "../services/laudos";
import { codigoDoRotulo } from "../services/rotulosAnimal";
import type { Rotulos } from "../services/rotulosAnimal";

const POR_PAGINA = 50;
const ESPERA_DA_BUSCA_MS = 300;
const SEM_FILTRO = "Todos";

class SemPdf extends Error {}

export interface ItemDaLista {
    id: string;
    nome: string;
    /** Porte, pelagem, plumagem, tipo de água ou grupo. */
    atributo: string;
    raca: string;
    nascimento: string;
    quantidadeLaudos: number;
}

/** A tela não tem paginação, então busca todas as páginas. */
async function listarTodos(especie: Especie, termo: string, atributo: string): Promise<AnimalAdminResumo[]> {
    const animais: AnimalAdminResumo[] = [];
    let totalPaginas = 1;
    for (let page = 0; page < totalPaginas; page++) {
        const pagina = await listarAnimais({ especie, termo, atributo, page, size: POR_PAGINA });
        animais.push(...pagina.conteudo);
        totalPaginas = pagina.totalPaginas;
    }
    return animais;
}

/**
 * Comunicação das telas de lista do painel com a API: busca, filtro e exclusão (RF28).
 * O visual fica em cada tela.
 */
export function useListaAnimais(especie: Especie, nomeDoAtributo: string, rotulos?: Rotulos) {
    const navigate = useNavigate();
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState(SEM_FILTRO);
    const [animais, setAnimais] = useState<AnimalAdminResumo[] | null>(null);
    const [erro, setErro] = useState("");
    const [versao, setVersao] = useState(0); // muda para recarregar a lista
    const [valoresUsados, setValoresUsados] = useState<string[]>([]);

    const atributo = filtro === SEM_FILTRO ? "" : codigoDoRotulo(rotulos, filtro);

    useEffect(() => {
        let ativo = true; // ignora respostas de buscas antigas
        const espera = setTimeout(() => {
            listarTodos(especie, busca.trim(), atributo)
                .then((lista) => {
                    if (!ativo) return;
                    setAnimais(lista);
                    setErro("");
                })
                .catch((e) => {
                    if (!ativo) return;
                    if (naoAutenticado(e)) navigate("/login");
                    else setErro(mensagemDeErro(e));
                });
        }, busca ? ESPERA_DA_BUSCA_MS : 0);
        return () => {
            ativo = false;
            clearTimeout(espera);
        };
    }, [especie, busca, atributo, versao, navigate]);

    // Opções do filtro que vieram de cadastros (ex.: uma plumagem nova).
    useEffect(() => {
        let ativo = true;
        listarValoresUsados(especie)
            .then((valores) => ativo && setValoresUsados(valores))
            .catch(() => {}); // ficam as opções fixas; a lista mostra o erro
        return () => { ativo = false; };
    }, [especie, versao]);

    async function excluir(id: string, nome: string): Promise<void> {
        if (!window.confirm(`Deseja realmente excluir "${nome}"?`)) return;
        try {
            await excluirAnimal(id);
            setVersao((v) => v + 1);
        } catch (e) {
            if (naoAutenticado(e)) navigate("/login");
            else alert(mensagemDeErro(e));
        }
    }

    /** RF26 — abre o PDF do laudo mais recente em outra aba. */
    async function verLaudo(item: ItemDaLista): Promise<void> {
        const semPdf = `${item.nome} não tem laudo em PDF.`;
        if (item.quantidadeLaudos === 0) {
            alert(semPdf);
            return;
        }
        try {
            await abrirLaudo(listarLaudos(item.id).then((laudos) => {
                const url = laudos
                    .filter((laudo) => laudo.arquivoUrl)
                    .sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao))[0]?.arquivoUrl;
                if (!url) throw new SemPdf();
                return url;
            }));
        } catch (e) {
            if (naoAutenticado(e)) navigate("/login");
            else alert(e instanceof SemPdf ? semPdf : "Não foi possível abrir o laudo.");
        }
    }

    const lista: ItemDaLista[] = (erro ? [] : animais ?? []).map((animal) => {
        const valor = animal.atributos[nomeDoAtributo];
        return {
            id: animal.id,
            nome: animal.nome,
            atributo: valor === null || valor === undefined ? "—" : rotulos?.[String(valor)] ?? String(valor),
            raca: animal.raca,
            nascimento: animal.dataNascimento
                ? new Date(`${animal.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR")
                : "—",
            quantidadeLaudos: animal.quantidadeLaudos
        };
    });

    return {
        busca,
        setBusca,
        filtro,
        setFiltro,
        lista,
        valoresUsados,
        /** Erro ou "Carregando..."; vazio quando a lista já veio. */
        aviso: erro || (animais ? "" : "Carregando..."),
        excluir,
        verLaudo
    };
}
