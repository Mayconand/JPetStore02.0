import { t } from "../../services/idioma";
import "./Home.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import imagemhome from "../../assets/imagens/imagemhome.png";
import AnimalCategories from "../../components/store/AnimalCategories";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="container">

            <header>
                <img src={logo} alt="Logo JPetStore" className="logo"/>

                <nav>
                    <Link to="/login">{t("Entrar")}</Link>
                    <Link to="/cadastroUser" className="btnCadastro">
                        {t("Cadastre-se")}
                    </Link>
                </nav>
            </header>

            <main>
                <section className="presentation">

                    <div className="presentationText">
                        <h1>
                            {t("Seu novo") + " "}<span>{t("melhor amigo")}</span>{" " + t("está aqui!")}
                        </h1>

                        <p>
                            {t("Encontre seu companheiro ideal e descubra o amor que só um pet pode oferecer.")}
                        </p>

                        <a href="/cadastroUser" className="btnCadastro">
                            {t("Cadastre-se")}
                        </a>
                    </div>

                    <div className="presentationImage">
                        <img
                            src={imagemhome}
                            alt={t("Imagem de uma mulher com um cachorro")}
                            className="imagemhome"
                        />
                    </div>

                </section>

                <div className="scallop-divider"></div>
                <AnimalCategories />
            </main>

            <footer>
                
            </footer>

        </div>
    );
}

export default Home;