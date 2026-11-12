import { api } from "./api";
import type { Papel } from "./api";

/** Dados de um Endereço (o mesmo serve para entrega e cobrança). */
export interface DadosEndereco {
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep: string;
    pais?: string;
}

export interface Endereco extends DadosEndereco {
    id: string;
    principal: boolean;
}

export type Idioma = "pt-BR" | "en" | "es";

export interface CadastroEntrada {
    nome: string;
    sobrenome: string;
    email: string;
    telefone?: string;
    senha: string;
    idiomaPreferencial?: Idioma;
    preferencias?: Record<string, unknown>;
    /** O primeiro endereço vira o principal. */
    enderecos: DadosEndereco[];
}

export interface Perfil {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string | null;
    papel: Papel;
    idiomaPreferencial: Idioma;
    preferencias: Record<string, unknown>;
    enderecos: Endereco[];
}

export type AlterarPerfilEntrada = Omit<CadastroEntrada, "senha" | "enderecos">;

/** RF03 — Realizar Cadastro. */
export async function cadastrar(dados: CadastroEntrada): Promise<Perfil> {
    const { data } = await api.post<Perfil>("/api/usuarios", dados);
    return data;
}

/** RF04 — Visualizar Perfil. */
export async function obterPerfil(): Promise<Perfil> {
    const { data } = await api.get<Perfil>("/api/usuarios/me");
    return data;
}

/** RF05 — Alterar Perfil. */
export async function alterarPerfil(dados: AlterarPerfilEntrada): Promise<Perfil> {
    const { data } = await api.put<Perfil>("/api/usuarios/me", dados);
    return data;
}

/** RF05 — Alterar senha. */
export async function alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    await api.put("/api/usuarios/me/senha", { senhaAtual, novaSenha });
}
