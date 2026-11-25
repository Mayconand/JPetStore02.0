import { api } from "./api";

export interface Rodape {
    visivel: boolean;
    conteudoHtml: string | null;
}

export async function obterRodape(): Promise<Rodape> {
    const { data } = await api.get<Rodape>("/api/rodape");
    return data;
}

export async function definirVisibilidade(visivel: boolean): Promise<Rodape> {
    const { data } = await api.post<Rodape>(`/api/rodape/${visivel ? "habilitar" : "desabilitar"}`);
    return data;
}

export async function personalizarRodape(conteudoHtml: string): Promise<Rodape> {
    const { data } = await api.put<Rodape>("/api/rodape", { conteudoHtml });
    return data;
}
