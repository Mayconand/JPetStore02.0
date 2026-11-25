import { t } from "../../services/idioma";
import "./Login.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import imagemLogin from "../../assets/imagens/imagemLogin.png";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { mensagemDeErro } from "../../services/api";

function Login() {
    const navigate = useNavigate();
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    // RF02 — Realizar Login
    async function entrar(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const dados = new FormData(event.currentTarget);

        setErro("");
        setEnviando(true);
        try {
            const sessao = await login(String(dados.get("email")), String(dados.get("password")));
            navigate(sessao.usuario.papel === "ADMIN" ? "/DashboardAdm" : "/HomeClient");
        } catch (e) {
            setErro(mensagemDeErro(e));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="loginContainer">

            <section className="login">

                <img
                    src={logo}
                    alt="Logo JPetStore"
                    className="loginLogo"
                />

                <div className="loginForm">

                    <h1>{t("Olá!")}</h1>

                    <p className="loginDescription">
                        {t("Entre na sua conta e fique mais perto de encontrar seu novo companheiro de estimação")}
                    </p>

                    <form onSubmit={entrar}>

                        <label>{t("Email")}</label>
                        <input type="email" name="email" autoComplete="email" required />

                        <label>{t("Senha")}</label>
                        <input type="password" name="password" autoComplete="current-password" required />

                        <Link to="/recuperar-senha" className="forgotPassword">
                            {t("Esqueceu a senha?")}
                        </Link>

                        {erro && (
                            <p className="formErro" role="alert">{t(erro)}</p>
                        )}

                        <button type="submit" disabled={enviando}>
                            {enviando ? t("Entrando...") : t("Entrar")}
                        </button>

                        <p className="registerText">
                            {t("Não possui conta?") + " "}<a href="/CadastroUser">{t("Cadastre-se")}</a>
                        </p>

                        <hr />

                        <p className="contactText">
                            {t("Para mais informações entre em contato com")}
                            <a href="mailto:contato@jpetstore.com">
                                contato@jpetstore.com
                            </a>
                        </p>

                    </form>

                </div>

            </section>

            <section className="loginImage">

                <img
                    src={imagemLogin}
                    alt={t("Cachorro em um ambiente externo")}
                />

                <div className="loginMessage">
                    <h2>
                        {t("Uma nova amizade começa com uma patinha.")}
                    </h2>

                    <p>
                        {t("Conheça nossos animais e encontre aquele que vai transformar sua casa em um lar ainda mais feliz.")}
                    </p>
                </div>

            </section>

        </div>
    );
}

export default Login;