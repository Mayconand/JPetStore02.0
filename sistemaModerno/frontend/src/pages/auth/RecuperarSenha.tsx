import { t } from "../../services/idioma";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { redefinirSenha, solicitarRecuperacao } from "../../services/auth";
import { mensagemDeErro } from "../../services/api";
import "./Login.css";

export default function RecuperarSenha() {
    const { hash } = useLocation();
    const token = new URLSearchParams(hash.slice(1)).get("token");
    return <FormularioRecuperacao key={hash} token={token} />;
}

function FormularioRecuperacao({ token }: { token: string | null }) {
    const [enviando, setEnviando] = useState(false);
    const [concluido, setConcluido] = useState(false);
    const [erro, setErro] = useState("");

    async function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const campos = new FormData(evento.currentTarget);
        const novaSenha = String(campos.get("senha"));
        if (token && novaSenha !== campos.get("confirmacao")) {
            setErro("As senhas devem ser iguais.");
            return;
        }
        setErro("");
        setEnviando(true);
        try {
            if (token) await redefinirSenha(token, novaSenha);
            else await solicitarRecuperacao(String(campos.get("email")));
            setConcluido(true);
        } catch (falha) {
            setErro(mensagemDeErro(falha));
        } finally {
            setEnviando(false);
        }
    }

    return <main className="loginContainer">
        <section className="login">
            <div className="loginForm">
                <h1>{token ? t("Redefinir senha") : t("Recuperar senha")}</h1>
                {concluido ? <p role="status">{token
                    ? t("Senha redefinida. Entre com sua nova senha.")
                    : t("Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.")}</p>
                    : <form onSubmit={enviar}>
                        {token ? <>
                            <label htmlFor="senha">{t("Nova senha")}</label>
                            <input id="senha" name="senha" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
                            <label htmlFor="confirmacao">{t("Confirme a nova senha")}</label>
                            <input id="confirmacao" name="confirmacao" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
                        </> : <>
                            <label htmlFor="email">{t("E-mail da conta")}</label>
                            <input id="email" name="email" type="email" autoComplete="email" required />
                        </>}
                        <button type="submit" disabled={enviando}>{token ? t("Salvar nova senha") : t("Enviar link")}</button>
                    </form>}
                {erro && <p className="formErro" role="alert">{t(erro)}</p>}
                <Link to="/login">{t("Voltar ao login")}</Link>
            </div>
        </section>
    </main>;
}
