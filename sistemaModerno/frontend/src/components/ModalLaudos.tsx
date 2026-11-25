import { t } from "../services/idioma";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { laudosDaFicha } from "../services/animais";
import { abrirLaudo } from "../services/laudos";
import type { Laudo } from "../services/laudos";
import { mensagemDeErro, naoAutenticado } from "../services/api";

interface Props {
    animalId: string;
    nome: string;
    onFechar: () => void;
}

/** RF26 — janela de laudos da tela inicial do cliente (mesmo HTML e CSS), com os laudos da API. */
function ModalLaudos({ animalId, nome, onFechar }: Props) {
    const navigate = useNavigate();
    const [laudos, setLaudos] = useState<Laudo[]>([]);
    const [aviso, setAviso] = useState("Carregando...");

    useEffect(() => {
        let ativo = true;
        laudosDaFicha(animalId)
            .then((lista) => {
                if (!ativo) return;
                setLaudos(lista);
                setAviso(lista.length ? "" : t("{nome} ainda não tem laudos.", { nome }));
            })
            .catch((e) => ativo && setAviso(mensagemDeErro(e)));
        return () => { ativo = false; };
    }, [animalId, nome]);

    async function abrir(event: MouseEvent, arquivoUrl: string): Promise<void> {
        event.preventDefault();
        try {
            await abrirLaudo(arquivoUrl);
        } catch (e) {
            if (naoAutenticado(e)) navigate("/login");
            else alert(t("Não foi possível abrir o laudo."));
        }
    }

    return (
        <div className="modalOverlay" onClick={onFechar}>

            <div className="modalLaudo" onClick={(event) => event.stopPropagation()}>

                <div className="modalHeader">

                    <h2>{t("Laudos -") + " "}{nome}</h2>

                    <button
                        type="button"
                        className="btnFecharModal"
                        onClick={onFechar}
                        aria-label={t("Fechar laudo")}
                    >
                        ×
                    </button>

                </div>

                <div className="modalPdf">

                    <span>PDF</span>

                    {aviso && <p>{t(aviso)}</p>}

                    {laudos.map((laudo) => (
                        <p key={laudo.id}>
                            {laudo.arquivoUrl
                                ? <a href="#" onClick={(event) => void abrir(event, laudo.arquivoUrl!)}>{laudo.titulo}</a>
                                : `${laudo.titulo} (sem arquivo)`}
                        </p>
                    ))}

                </div>

            </div>

        </div>
    );
}

export default ModalLaudos;
