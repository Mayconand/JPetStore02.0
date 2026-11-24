import type { DadosEndereco } from "./usuarios";

/** Reaproveita os campos do endereço, sem usar o texto formatado para exibição. */
export function reutilizarEndereco(endereco: DadosEndereco | undefined): DadosEndereco {
    if (!endereco?.rua?.trim() || !endereco.numero?.trim()) {
        throw new Error("O endereço cadastrado está sem rua ou número. Complete o endereço antes de continuar.");
    }
    return {
        rua: endereco.rua.trim(),
        numero: endereco.numero.trim(),
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        cep: endereco.cep,
        pais: endereco.pais
    };
}

/** Com o CEP, a rua já é conhecida: o campo existente recebe "42, Apto 2". */
export function separarEnderecoCadastro(ruaDoCep: string | undefined, texto: string) {
    const partes = texto.split(",").map(parte => parte.trim());
    const rua = ruaDoCep?.trim() || partes.shift() || "";
    const numero = partes.shift() || "";
    if (!rua || !numero || !/^(?:\d[\p{L}\d /-]*|s\s*\/?\s*n)$/iu.test(numero)) {
        throw new Error(ruaDoCep
            ? "Informe o número da residência e o complemento, por exemplo: 42, Apto 2. Use s/n para endereço sem número."
            : "Informe rua, número e complemento, por exemplo: Rua das Flores, 42, Apto 2.");
    }
    return { rua, numero, complemento: partes.join(", ") || undefined };
}
