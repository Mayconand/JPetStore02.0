import "./Home.css";
import logo from "../../assets/imagens/logoJPetStore.png";
import imagemhome from "../../assets/imagens/imagemhome.png";
import AnimalCategories from "../../components/store/AnimalCategories";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="container">

            <header>
                <img src={logo} alt="Logo JPetStore" className="logo"/>

                <nav>
                    <Link to="/login">Entrar</Link>
                    <Link to="/cadastroUser" className="btnCadastro">
                        Cadastre-se
                    </Link>
                </nav>
            </header>

            <main>
                <section className="presentation">

                    <div className="presentationText">
                        <h1>
                            Seu novo <span>melhor amigo</span> está aqui!
                        </h1>

                        <p>
                            Encontre seu companheiro ideal e descubra
                            o amor que só um pet pode oferecer.
                        </p>

                        <a href="/cadastroUser" className="btnCadastro">
                            Cadastre-se
                        </a>
                    </div>

                    <div className="presentationImage">
                        <img
                            src={imagemhome}
                            alt="Imagem de uma mulher com um cachorro"
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