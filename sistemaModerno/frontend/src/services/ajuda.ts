import { api } from "./api";

export interface TopicoAjuda {
    id: string;
    titulo: string;
    conteudo: string;
}

/** RF22 — Acessar informações de ajuda. A busca ignora acentos. */
export async function listarAjuda(termo = ""): Promise<TopicoAjuda[]> {
    const { data } = await api.get<TopicoAjuda[]>("/api/ajuda", { params: termo ? { termo } : {} });
    return data;
}
