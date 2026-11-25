import { useSyncExternalStore } from "react";
import traducoes from "./traducoes";
import type { Idioma } from "./usuarios";

const CHAVE = "jpetstore.idioma";
const ouvintes = new Set<() => void>();

function idiomaSalvo(): Idioma {
    const idioma = localStorage.getItem(CHAVE);
    return idioma === "en" || idioma === "es" ? idioma : "pt-BR";
}

export function definirIdioma(idioma: Idioma) {
    if (idioma === idiomaSalvo()) return;
    localStorage.setItem(CHAVE, idioma);
    ouvintes.forEach(notificar => notificar());
}

function assinar(notificar: () => void) {
    ouvintes.add(notificar);
    window.addEventListener("storage", notificar);
    return () => {
        ouvintes.delete(notificar);
        window.removeEventListener("storage", notificar);
    };
}

export function useIdioma() {
    return useSyncExternalStore(assinar, idiomaSalvo);
}

export function t(texto: string, dados?: Record<string, string | number>): string {
    const idioma = idiomaSalvo();
    const alternativas = Object.hasOwn(traducoes, texto) ? traducoes[texto] : undefined;
    const resultado = idioma !== "pt-BR" && alternativas ? alternativas[idioma === "en" ? 0 : 1] : texto;
    return dados ? resultado.replace(/\{(\w+)\}/g, (original, chave: string) => String(dados[chave] ?? original)) : resultado;
}

/** Mantém os valores em reais e adapta a forma de exibição ao idioma. */
export function moedaLocal(valor: number) {
    return valor.toLocaleString(idiomaSalvo(), { style: "currency", currency: "BRL" });
}

export function idiomaAtual() {
    return idiomaSalvo();
}
