import { api, urlDoArquivo } from "./api";
import type { Laudo } from "./laudos";

import imgCachorro from "../assets/imagens/animais/cachorro.png";
import imgGato from "../assets/imagens/animais/gato.png";
import imgPassaro from "../assets/imagens/animais/passaro.png";
import imgPeixe from "../assets/imagens/animais/peixe.png";
import imgReptil from "../assets/imagens/animais/reptil.png";

export type Especie = "CACHORRO" | "GATO" | "PASSARO" | "PEIXE" | "REPTIL";

export interface AnimalResumo {
    id: string;
    nome: string;
    especie: Especie;
    racaId: string;
    raca: string;
    dataNascimento: string | null;
    sexo: "MACHO" | "FEMEA" | null;
    castrado: boolean;
    preco: number;
    descricao: string | null;
    imagemUrl: string | null;
    tags: string[];
}

export interface Pagina<T> {
    conteudo: T[];
    pagina: number;
    tamanho: number;
    totalElementos: number;
    totalPaginas: number;
}

export interface FiltroAnimais {
    /** Procura em nome, descrição, raça e tags (sem diferenciar acentos). */
    termo?: string;
    /** Aceita "Cachorro", "Reptil", "Réptil", "CACHORRO"... */
    especie?: string;
    raca?: string;
    precoMin?: number;
    precoMax?: number;
    page?: number;
    size?: number;
}

/** RF07 — Buscar Animais (somente disponíveis). */
export async function buscarAnimais(filtro: FiltroAnimais = {}): Promise<Pagina<AnimalResumo>> {
    const params = Object.fromEntries(
        Object.entries(filtro).filter(([, valor]) => valor !== undefined && valor !== "")
    );
    const { data } = await api.get<Pagina<AnimalResumo>>("/api/animais", { params });
    return data;
}

/** Ficha completa de um animal. */
export interface FichaAnimal {
    id: string;
    nome: string;
    especie: Especie;
    raca: { id: string; nome: string };
    dataNascimento: string | null;
    sexo: "MACHO" | "FEMEA" | null;
    castrado: boolean;
    descricao: string | null;
    preco: number;
    disponivel: boolean;
    cuidados: string | null;
    atributos: Record<string, string | number | null>;
    imagens: string[];
    tags: string[];
    laudos: Laudo[];
}

/** RF16 — Visualizar Animal (rota pública; inclui os laudos). */
export async function obterFicha(id: string): Promise<FichaAnimal> {
    const { data } = await api.get<FichaAnimal>(`/api/animais/${id}`);
    return data;
}

/** RF26 — laudos na visão do cliente. */
export async function laudosDaFicha(id: string): Promise<Laudo[]> {
    return (await obterFicha(id)).laudos;
}

/** Raças cadastradas da espécie (rota pública). Aceita "Cachorro", "Réptil", "REPTIL"... */
export async function listarRacasDoCatalogo(especie: string): Promise<string[]> {
    const { data } = await api.get<string[]>("/api/animais/racas", { params: { especie } });
    return data;
}

/** Foto do animal ou, sem foto, a ilustração da espécie. */
export function fotoOuPadrao(url: string | null | undefined, especie: Especie): string {
    return url ? urlDoArquivo(url) : IMAGEM_PADRAO[especie];
}

const IMAGEM_PADRAO: Record<Especie, string> = {
    CACHORRO: imgCachorro,
    GATO: imgGato,
    PASSARO: imgPassaro,
    PEIXE: imgPeixe,
    REPTIL: imgReptil
};

/** Formato usado pelos cards de animal das páginas do cliente. */
export interface CardPet {
    id: string;
    nome: string;
    raca: string;
    nascimento: string;
    dataNascimento: string | null;
    sexo: string;
    castrado: string;
    imagem: string;
    tags: string[];
    preco: number;
}

export function paraCardPet(animal: AnimalResumo): CardPet {
    return {
        id: animal.id,
        nome: animal.nome,
        raca: animal.raca,
        nascimento: animal.dataNascimento
            ? new Date(`${animal.dataNascimento}T00:00:00`).toLocaleDateString("pt-BR")
            : "Não informado",
        dataNascimento: animal.dataNascimento,
        sexo: animal.sexo === "MACHO" ? "Macho" : animal.sexo === "FEMEA" ? "Fêmea" : "Não informado",
        castrado: animal.castrado ? "Sim" : "Não",
        imagem: fotoOuPadrao(animal.imagemUrl, animal.especie),
        tags: animal.tags,
        preco: animal.preco
    };
}
