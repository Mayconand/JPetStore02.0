
interface EnderecoCEP {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export async function buscarCEP(cep: string): Promise<EnderecoCEP> {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
        throw new Error("Digite um CEP válido.");
    }

    const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    if (!resposta.ok) {
        throw new Error("Não foi possível consultar o CEP.");
    }

    const endereco: EnderecoCEP = await resposta.json();

    if (endereco.erro) {
        throw new Error("CEP não encontrado.");
    }

    return endereco;
}
