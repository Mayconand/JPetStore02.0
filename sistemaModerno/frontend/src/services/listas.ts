/** Junta listas de opções sem repetir (ignora maiúsculas). */
export function juntarOpcoes(...listas: string[][]): string[] {
    const opcoes: string[] = [];
    for (const opcao of listas.flat()) {
        if (!opcoes.some((outra) => outra.toLowerCase() === opcao.toLowerCase())) opcoes.push(opcao);
    }
    return opcoes;
}
