import axios, { AxiosError } from "axios";

/**
 * Cliente HTTP do backend JPetStore.
 * Em desenvolvimento, o Vite encaminha /api para o backend (ver vite.config.ts).
 * Em outro ambiente, defina VITE_API_URL (ex.: https://api.jpetstore.com).
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

/** Endereço completo de um arquivo servido pelo backend (ex.: foto). Links externos não mudam. */
export function urlDoArquivo(url: string): string {
    return url.startsWith("/api/") ? BASE_URL + url : url;
}

const CHAVE_SESSAO = "jpetstore.sessao";

export type Papel = "CLIENTE" | "ADMIN";

export interface Sessao {
    token: string;
    expiraEm: string;
    usuario: {
        id: string;
        nome: string;
        email: string;
        papel: Papel;
    };
}

export function obterSessao(): Sessao | null {
    try {
        const texto = localStorage.getItem(CHAVE_SESSAO);
        if (!texto) return null;

        const sessao = JSON.parse(texto) as Sessao;
        if (new Date(sessao.expiraEm).getTime() <= Date.now()) {
            limparSessao();
            return null;
        }
        return sessao;
    } catch {
        return null;
    }
}

export function salvarSessao(sessao: Sessao): void {
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function limparSessao(): void {
    localStorage.removeItem(CHAVE_SESSAO);
}

// Envia o token em toda requisição, quando houver sessão.
api.interceptors.request.use((config) => {
    const sessao = obterSessao();
    if (sessao) {
        config.headers.Authorization = `Bearer ${sessao.token}`;
    }
    return config;
});

// Token expirado/revogado: descarta a sessão local.
api.interceptors.response.use(
    (resposta) => resposta,
    (erro: AxiosError) => {
        if (erro.response?.status === 401 && obterSessao()) {
            limparSessao();
        }
        return Promise.reject(erro);
    }
);

/** Formato dos erros devolvidos pelo backend. */
export interface ErroApi {
    codigo: string;
    mensagem: string;
    campos?: Record<string, string>;
}

/** Extrai uma mensagem amigável de qualquer erro de requisição. */
export function mensagemDeErro(erro: unknown): string {
    if (axios.isAxiosError<ErroApi>(erro)) {
        const corpo = erro.response?.data;
        if (corpo?.campos) {
            return Object.entries(corpo.campos)
                .map(([campo, msg]) => `${campo}: ${msg}`)
                .join("\n");
        }
        if (corpo?.mensagem) return corpo.mensagem;
        if (erro.response?.status === 401) return "Faça login para continuar.";
        if (!erro.response) return "Não foi possível conectar ao servidor.";
    }
    return "Ocorreu um erro inesperado.";
}

/** true quando o erro é de usuário não autenticado (sem login ou sessão expirada). */
export function naoAutenticado(erro: unknown): boolean {
    return axios.isAxiosError(erro) && erro.response?.status === 401;
}
