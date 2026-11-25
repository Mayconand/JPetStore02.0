import { t } from "../../services/idioma";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { alterarSenha } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado } from "../../services/api";

export default function AlteracaoSenha() {
    const navigate = useNavigate();
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const campos = new FormData(formulario);
        const nova = String(campos.get("novaSenha"));
        setSucesso(false);
        if (nova !== campos.get("confirmacao")) {
            setErro("As senhas devem ser iguais.");
            return;
        }
        setErro("");
        setSalvando(true);
        try {
            await alterarSenha(String(campos.get("senhaAtual")), nova);
            formulario.reset();
            setSucesso(true);
        } catch (falha) {
            if (naoAutenticado(falha)) navigate("/login");
            else setErro(mensagemDeErro(falha));
        } finally {
            setSalvando(false);
        }
    }

    return <section className="profileSection profileConfiguracao">
        <h2>{t("Alterar senha")}</h2>
        <form onSubmit={salvar}>
            <label>{t("Senha atual")}<input name="senhaAtual" type="password" autoComplete="current-password" required /></label>
            <label>{t("Nova senha")}<input name="novaSenha" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
            <label>{t("Confirme a nova senha")}<input name="confirmacao" type="password" autoComplete="new-password" minLength={8} maxLength={72} required /></label>
            <button type="submit" disabled={salvando}>{t("Salvar nova senha")}</button>
        </form>
        {sucesso && <p role="status">{t("Senha alterada com sucesso.")}</p>}
        {erro && <p role="alert">{t(erro)}</p>}
    </section>;
}
