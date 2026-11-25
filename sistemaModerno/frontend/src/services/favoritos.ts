import { api } from "./api";
import type { Especie } from "./animais";

export interface Favorito {
    id: string;
    especie: Especie;
    raca: string;
}

export async function listarFavoritos(): Promise<Favorito[]> {
    const { data } = await api.get<Favorito[]>("/api/usuarios/me/favoritos");
    return data;
}

export async function incluirFavorito(especie: Especie, raca: string): Promise<void> {
    await api.put("/api/usuarios/me/favoritos", { especie, raca });
}

export async function excluirFavorito(id: string): Promise<void> {
    await api.delete(`/api/usuarios/me/favoritos/${id}`);
}
