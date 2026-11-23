import { api } from "./api";
import type { Especie, Pagina } from "./animais";
import type { Laudo } from "./laudos";

/** Valores dos campos próprios de cada espécie, como vêm do backend. */
export type Atributos = Record<string, string | number | null>;

export interface AnimalAdminResumo {
    id: string;
    nome: string;
    especie: Especie;
    racaId: string;
    raca: string;
    dataNascimento: string | null;
    preco: number;
    disponivel: boolean;
    atributos: Atributos;
    quantidadeLaudos: number;
}

export interface ImagemGaleria {
    id: string;
    url: string;
    principal: boolean;
}

export interface AnimalAdmin {
    id: string;
    nome: string;
    especie: Especie;
    raca: { id: string; nome: string };
    dataNascimento: string | null;
    sexo: "MACHO" | "FEMEA" | null;
    descricao: string | null;
    preco: number;
    disponivel: boolean;
    atributos: Atributos;
    galeria: ImagemGaleria[];
    tags: string[];
    laudos: Laudo[];
}

export interface Raca {
    id: string;
    especie: Especie;
    nome: string;
}

export interface FiltroAdmin {
    especie: Especie;
    termo?: string;
    /** Porte, pelagem, plumagem, tipo de água ou grupo, conforme a espécie. */
    atributo?: string;
    page?: number;
    size?: number;
}

/** Campos do formulário; os da espécie (porte, altura, ph...) entram como chaves extras. */
export interface DadosAnimal {
    especie: Especie;
    racaId: string;
    nome: string;
    preco: string;
    dataNascimento: string | null;
    descricao: string | null;
    sexo: string | null;
    disponivel?: boolean;
    tags: string[];
    imagensRemovidas: string[];
    laudosRemovidos: string[];
    [campoDaEspecie: string]: unknown;
}

export interface ArquivosAnimal {
    imagemPrincipal: File | null;
    fotos: File[];
    laudos: File[];
}

export async function listarAnimais(filtro: FiltroAdmin): Promise<Pagina<AnimalAdminResumo>> {
    const params = Object.fromEntries(Object.entries(filtro).filter(([, valor]) => valor !== undefined && valor !== ""));
    const { data } = await api.get<Pagina<AnimalAdminResumo>>("/api/admin/animais", { params });
    return data;
}

export async function obterAnimal(id: string): Promise<AnimalAdmin> {
    const { data } = await api.get<AnimalAdmin>(`/api/admin/animais/${id}`);
    return data;
}

/** Valores já usados no texto livre da espécie: pelagem, plumagem, estirpe ou mutação. */
export async function listarValoresUsados(especie: Especie): Promise<string[]> {
    const { data } = await api.get<string[]>("/api/admin/animais/valores", { params: { especie } });
    return data;
}

/** RF23 / RF27 — cadastra (sem id) ou edita, com os arquivos na mesma requisição. */
export async function salvarAnimal(id: string | undefined, dados: DadosAnimal, arquivos: ArquivosAnimal): Promise<AnimalAdmin> {
    const form = new FormData();
    form.append("dados", new Blob([JSON.stringify(dados)], { type: "application/json" }));
    if (arquivos.imagemPrincipal) form.append("imagemPrincipal", arquivos.imagemPrincipal);
    arquivos.fotos.forEach((foto) => form.append("fotos", foto));
    arquivos.laudos.forEach((laudo) => form.append("laudos", laudo));

    const { data } = await api.request<AnimalAdmin>({
        method: id ? "put" : "post",
        url: id ? `/api/admin/animais/${id}` : "/api/admin/animais",
        data: form,
        // Sem isto, o padrão do cliente (JSON) converteria o formulário e descartaria os arquivos.
        headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
}

/** RF28 — Excluir Animais. */
export async function excluirAnimal(id: string): Promise<void> {
    await api.delete(`/api/admin/animais/${id}`);
}

/** RF26 — Ver Laudos. */
export async function listarLaudos(animalId: string): Promise<Laudo[]> {
    const { data } = await api.get<Laudo[]>(`/api/admin/animais/${animalId}/laudos`);
    return data;
}

export async function listarRacas(especie: Especie): Promise<Raca[]> {
    const { data } = await api.get<Raca[]>("/api/admin/racas", { params: { especie } });
    return data;
}

/** RF24 — Cadastrar Raça. */
export async function cadastrarRaca(especie: Especie, nome: string): Promise<Raca> {
    const { data } = await api.post<Raca>("/api/admin/racas", { especie, nome });
    return data;
}

/** RF17 — Buscar Tags. */
export async function buscarTags(termo: string): Promise<string[]> {
    const { data } = await api.get<{ nome: string }[]>("/api/animais/tags", { params: { termo } });
    return data.map((tag) => tag.nome);
}
