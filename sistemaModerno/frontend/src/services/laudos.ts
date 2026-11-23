import { api } from "./api";

export interface Laudo {
    id: string;
    titulo: string;
    descricao: string | null;
    dataEmissao: string;
    /** Nulo quando o laudo não tem PDF. */
    arquivoUrl: string | null;
}

const VALIDADE_DO_LINK_MS = 60_000;

/** O PDF exige login, então é baixado pela API (com o token) em vez de aberto por um link direto. */
export async function baixarLaudo(arquivoUrl: string): Promise<Blob> {
    const { data } = await api.get<Blob>(arquivoUrl, { responseType: "blob" });
    return data;
}

/** Abre o PDF em outra aba. Chame direto do clique, sem esperar o endereço. */
export async function abrirLaudo(arquivoUrl: string | Promise<string>): Promise<void> {
    // A aba é aberta já no clique; depois da espera, o navegador a bloquearia como pop-up.
    const aba = window.open("", "_blank");
    try {
        const link = URL.createObjectURL(await baixarLaudo(await arquivoUrl));
        if (aba) aba.location.href = link;
        setTimeout(() => URL.revokeObjectURL(link), VALIDADE_DO_LINK_MS);
    } catch (erro) {
        aba?.close();
        throw erro;
    }
}
