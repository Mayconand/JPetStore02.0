import { api } from "./api";
import type { DadosEndereco } from "./usuarios";

export type StatusPedido = "AGUARDANDO_PAGAMENTO" | "PAGO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
export type ModalidadeEntrega = "RETIRADA" | "ENTREGA";

export interface PedidoResumo {
    id: string;
    dataCriacao: string;
    status: StatusPedido;
    modalidade: ModalidadeEntrega;
    valorTotal: number;
    quantidadeItens: number;
}

export interface Pedido {
    id: string;
    dataCriacao: string;
    status: StatusPedido;
    modalidade: ModalidadeEntrega;
    /** Cópia do endereço no momento da compra (null em RETIRADA). */
    enderecoEntrega: DadosEndereco | null;
    cupom: string | null;
    valorItens: number;
    valorDesconto: number;
    valorTotal: number;
    canceladoEm: string | null;
    itens: { animalId: string; nome: string; precoUnitario: number; imagemUrl: string | null }[];
}

/** RF06 — Visualizar Pedidos. */
export async function listarPedidos(): Promise<PedidoResumo[]> {
    const { data } = await api.get<PedidoResumo[]>("/api/pedidos");
    return data;
}

/** RF06 — Detalhe de um pedido. */
export async function obterPedido(id: string): Promise<Pedido> {
    const { data } = await api.get<Pedido>(`/api/pedidos/${id}`);
    return data;
}

/** Cria o pedido a partir do carrinho. enderecoId é obrigatório em ENTREGA. */
export async function criarPedido(modalidade: ModalidadeEntrega, enderecoId?: string): Promise<Pedido> {
    const { data } = await api.post<Pedido>("/api/pedidos", { modalidade, enderecoId });
    return data;
}

/** Cancela o pedido (somente antes do envio). */
export async function cancelarPedido(id: string): Promise<Pedido> {
    const { data } = await api.post<Pedido>(`/api/pedidos/${id}/cancelar`);
    return data;
}
