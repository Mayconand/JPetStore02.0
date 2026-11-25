import { api } from "./api";
import type { StatusPedido } from "./pedidos";

export interface PedidoAdmin {
    id: string;
    cliente: string;
    dataCriacao: string;
    status: StatusPedido;
    /** Nomes separados por vírgula. */
    animais: string;
}

/** RF30 — Filtrar pedidos. */
export async function filtrarPedidos(status?: StatusPedido): Promise<PedidoAdmin[]> {
    const { data } = await api.get<PedidoAdmin[]>("/api/admin/pedidos", { params: { status } });
    return data;
}

export interface ClienteAdmin {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string | null;
    quantidadePedidos: number;
    valorTotalGasto: number;
    ultimoPedido: string;
}

export async function listarClientes(): Promise<ClienteAdmin[]> {
    const { data } = await api.get<ClienteAdmin[]>("/api/admin/clientes");
    return data;
}

export async function alterarStatusPedido(id: string, status: "ENVIADO" | "ENTREGUE"): Promise<void> {
    await api.put(`/api/admin/pedidos/${id}/status`, { status });
}

export async function criarCupom(codigo: string, percentual: number, dataValidade: string): Promise<void> {
    await api.post("/api/admin/cupons", { codigo, percentual, dataValidade });
}
