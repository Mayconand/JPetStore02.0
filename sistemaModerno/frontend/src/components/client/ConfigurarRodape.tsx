import { t } from "../../services/idioma";
import { useEffect, useState, type FormEvent } from "react";
import { definirVisibilidade, obterRodape, personalizarRodape, type Rodape } from "../../services/rodape";
import { mensagemDeErro } from "../../services/api";

export default function ConfigurarRodape() {
    const [rodape, setRodape] = useState<Rodape | null>(null);
    const [conteudo, setConteudo] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        let ativo = true;
        obterRodape().then(config => {
            if (ativo) {
                setRodape(config);
                setConteudo(config.conteudoHtml ?? "");
            }
        }).catch(falha => { if (ativo) setErro(mensagemDeErro(falha)); });
        return () => { ativo = false; };
    }, []);

    async function salvar(operacao: () => Promise<Rodape>) {
        setSalvando(true);
        setErro("");
        setAviso("");
        try {
            setRodape(await operacao());
            setAviso("Configuração do rodapé salva.");
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    function personalizar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        void salvar(() => personalizarRodape(conteudo));
    }

    return <section className="profileSection profileConfiguracao">
        <h2>{t("Rodapé")}</h2>
        {rodape && <form onSubmit={personalizar}>
            <button type="button" disabled={salvando} onClick={() => salvar(() => definirVisibilidade(!rodape.visivel))}>
                {rodape.visivel ? t("Esconder rodapé") : t("Mostrar rodapé")}
            </button>
            <label>{t("Conteúdo do rodapé (texto ou HTML)")}
                <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} maxLength={20000} rows={4} />
            </label>
            <button type="submit" disabled={salvando}>{t("Salvar rodapé")}</button>
        </form>}
        {!rodape && !erro && <p role="status">{t("Carregando rodapé...")}</p>}
        {aviso && <p role="status">{t(aviso)}</p>}
        {erro && <p role="alert">{t(erro)}</p>}
    </section>;
}
