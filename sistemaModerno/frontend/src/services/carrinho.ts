import { api } from "./api";
import type { Especie } from "./animais";

/**
 * Cada animal é único: o carrinho não tem quantidade.
 * Itens com disponivel = false (vendidos para outra pessoa) não entram no total.
 */
export interface ItemCarrinho {
    animalId: string;
    nome: string;
    especie: Especie;
    raca: string;
    imagemUrl: string | null;
    precoUnitario: number;
    disponivel: boolean;
}

export interface Carrinho {
    id: string | null;
    itens: ItemCarrinho[];
    cupom: { codigo: string; percentualDesconto: number } | null;
    subtotal: number;
    desconto: number;
    total: number;
}

/** RF08 — Visualizar Carrinho. */
export async function obterCarrinho(): Promise<Carrinho> {
    const { data } = await api.get<Carrinho>("/api/carrinho");
    return data;
}

/** RF09 — Adicionar animal ao carrinho. */
export async function adicionarAoCarrinho(animalId: string): Promise<Carrinho> {
    const { data } = await api.post<Carrinho>("/api/carrinho/itens", { animalId });
    return data;
}

/** RF09 — Remover animal do carrinho. */
export async function removerDoCarrinho(animalId: string): Promise<Carrinho> {
    const { data } = await api.delete<Carrinho>(`/api/carrinho/itens/${animalId}`);
    return data;
}

/** RF09 — Esvaziar o carrinho. */
export async function limparCarrinho(): Promise<Carrinho> {
    const { data } = await api.delete<Carrinho>("/api/carrinho");
    return data;
}
