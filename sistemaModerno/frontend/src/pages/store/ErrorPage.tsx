
import "./ErrorPage.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import imgErro from "../../assets/imagens/imgErro.png";

import { Link } from "react-router-dom";

function ErrorPage() {

    return (

        <div className="container detailsPaymentPage">

            <header className="headerClient">

                <Link to="/" className="logoLink">

                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />

                </Link>

            </header>

            <main className="ErrorMain">

                <div id="conteinerTitulo">
                    <h1>ERR</h1>
                    <img src={imgErro} alt="Cachorro triste" className="imgErro"/>
                </div>

                <h2>Opa... Algo deu errado...</h2>
                

            </main>

        </div>

    );

}

export default ErrorPage;
