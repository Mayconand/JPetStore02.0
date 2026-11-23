/** Código da API -> texto da tela (o cadastro e a lista escrevem alguns de formas diferentes). */
export type Rotulos = Record<string, string>;

export const PORTES_DO_CADASTRO: Rotulos = {
    GRANDE: "Porte grande",
    MEDIO: "Pastor medio",
    PEQUENO: "Pastor pequeno"
};

export const PORTES_DA_LISTA: Rotulos = {
    GRANDE: "Porte Grande",
    MEDIO: "Porte Medio",
    PEQUENO: "Porte Pequeno"
};

export const GRUPOS: Rotulos = {
    LAGARTOS: "Lagartos",
    SERPENTES: "Serpentes",
    QUELONIOS: "Quelônios (Jabutis / Tartarugas)",
    CROCODILIANOS: "Crocodilianos"
};

export const GRUPOS_DA_LISTA: Rotulos = { ...GRUPOS, QUELONIOS: "Quelônios" };

export const TIPOS_DE_AGUA: Rotulos = {
    DOCE: "Água Doce",
    SALGADA: "Água Salgada (Marinho)"
};

export const TIPOS_DE_AGUA_DA_LISTA: Rotulos = { ...TIPOS_DE_AGUA, SALGADA: "Água Salgada" };

/** A API guarda o PH como número: cada faixa da tela é gravada pelo valor do meio. */
export const PHS: Rotulos = {
    "6.4": "Ácido (6.0 - 6.8)",
    "7": "Neutro (7.0)",
    "7.7": "Alcalino (7.2 - 8.2)"
};

/** Texto da tela -> código da API. Sem tabela (campo de texto livre), devolve o próprio texto. */
export function codigoDoRotulo(rotulos: Rotulos | undefined, texto: string): string {
    return Object.entries(rotulos ?? {}).find(([, rotulo]) => rotulo === texto)?.[0] ?? texto;
}
