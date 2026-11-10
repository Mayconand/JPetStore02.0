import { api, limparSessao, obterSessao, salvarSessao } from "./api";
import type { Sessao } from "./api";

/** RF02 — Realizar Login. */
export async function login(email: string, senha: string): Promise<Sessao> {
    const { data } = await api.post<Sessao>("/api/auth/login", { email, senha });
    salvarSessao(data);
    return data;
}

/** RF10 — Realizar Logout. A sessão local é apagada mesmo se o servidor falhar. */
export async function logout(): Promise<void> {
    try {
        if (obterSessao()) {
            await api.post("/api/auth/logout");
        }
    } finally {
        limparSessao();
    }
}
