import "./Login.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import imagemLogin from "../../assets/imagens/imagemLogin.png";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
            // A página do administrador ainda não existe; por enquanto todos vão para a área do cliente.
            await login(String(dados.get("email")), String(dados.get("password")));
            navigate("/HomeClient");
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

                    <h1>Olá!</h1>

                    <p className="loginDescription">
                        Entre na sua conta e fique mais perto de encontrar
                        seu novo companheiro de estimação
                    </p>

                    <form onSubmit={entrar}>

                        <label>Email</label>
                        <input type="email" name="email" autoComplete="email" required />

                        <label>Senha</label>
                        <input type="password" name="password" autoComplete="current-password" required />

                        <a href="/" className="forgotPassword">
                            Esqueceu a senha?
                        </a>

                        {erro && (
                            <p className="formErro" role="alert">{erro}</p>
                        )}

                        <button type="submit" disabled={enviando}>
                            {enviando ? "Entrando..." : "Entrar"}
                        </button>

                        <p className="registerText">
                            Não possui conta? <a href="/CadastroUser">Cadastre-se</a>
                        </p>

                        <hr />

                        <p className="contactText">
                            Para mais informações entre em contato com
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
                    alt="Cachorro em um ambiente externo"
                />

                <div className="loginMessage">
                    <h2>
                        Uma nova amizade começa com uma patinha.
                    </h2>

                    <p>
                        Conheça nossos animais e encontre aquele que vai
                        transformar sua casa em um lar ainda mais feliz.
                    </p>
                </div>

            </section>

        </div>
    );
}

export default Login;