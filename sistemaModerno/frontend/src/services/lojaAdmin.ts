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
