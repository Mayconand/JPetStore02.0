import "./Login.css";
import logo from "../../assets/imagens/logoJPetStore.png";
import imagemLogin from "../../assets/imagens/imagemLogin.png";

function Login() {
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

                    <form>

                        <label>Email</label>
                        <input type="email" name="email" required />

                        <label>Senha</label>
                        <input type="password" name="password" required />

                        <a href="/" className="forgotPassword">
                            Esqueceu a senha?
                        </a>

                        <button type="submit">Entrar</button>

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