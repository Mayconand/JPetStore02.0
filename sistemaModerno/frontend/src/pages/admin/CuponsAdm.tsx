import { t } from "../../services/idioma";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { criarCupom } from "../../services/lojaAdmin";
import { mensagemDeErro } from "../../services/api";
import "./DashboardAdm.css";

export default function CuponsAdm() {
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const campos = new FormData(formulario);
        const codigo = String(campos.get("codigo")).trim().toUpperCase();
        setErro("");
        setSucesso("");
        setSalvando(true);
        try {
            await criarCupom(codigo, Number(campos.get("percentual")), String(campos.get("validade")));
            formulario.reset();
            setSucesso(t("Cupom {codigo} criado.", { codigo }));
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    return <main className="adm-fluxo adm-status-section">
        <Link to="/DashboardAdm">{t("Voltar ao painel")}</Link>
        <h1>{t("Criar cupom")}</h1>
        <form onSubmit={salvar}>
            <label>{t("Código") + " "}<input name="codigo" required maxLength={64} /></label>
            <label>{t("Desconto (%)") + " "}<input name="percentual" type="number" required min="0.01" max="100" step="0.01" /></label>
            <label>{t("Válido até") + " "}<input name="validade" type="date" required /></label>
            <button type="submit" disabled={salvando}>{t("Criar cupom")}</button>
        </form>
        {erro && <p role="alert">{t(erro)}</p>}
        {sucesso && <p role="status">{sucesso}</p>}
    </main>;
}
