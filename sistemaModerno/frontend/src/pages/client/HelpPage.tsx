
import "./helpPage.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { Link } from "react-router-dom";

function HelpPage() {

    const questions = [
        {
            question: "Questão 1?",
            answer: "Resposta da primeira pergunta. Insira aqui as informações necessárias para ajudar o cliente."
        },
        {
            question: "Questão 2?",
            answer: "Resposta da segunda pergunta. Insira aqui as informações necessárias para ajudar o cliente."
        },
        {
            question: "Questão 3?",
            answer: "Resposta da terceira pergunta. Insira aqui as informações necessárias para ajudar o cliente."
        },
        {
            question: "Questão 4?",
            answer: "Resposta da quarta pergunta. Insira aqui as informações necessárias para ajudar o cliente."
        }
    ];

    return (
        <div className="container detailsPaymentPage helpPage">

            <header className="headerClient helpHeader">

                <Link to="/" className="logoLink">
                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />
                </Link>

                <div className="profileHeaderActions">

                    <div className="profileSearch">
                        <input
                            type="text"
                            placeholder="Buscar"
                        />

                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m16 16 5 5" />
                        </svg>
                    </div>

                    <Link
                        to="/carrinho"
                        className="profileHeaderIcon"
                        aria-label="Carrinho"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 3h2l2.5 12h11L21 7H5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="17" cy="19" r="1.5" />
                        </svg>
                    </Link>

                    <div className="profileUser">

                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                        </svg>

                        <span>
                            <strong>Nome:</strong> Fulano
                        </span>

                    </div>

                </div>

            </header>

            <main className="HelpMain">

                <section className="helpBanner">

                    <span className="helpTag">FAQs</span>

                    <h1>Como podemos ajudar?</h1>

                    <p>
                        Veja abaixo algumas dúvidas respondidas e se não
                        encontrar a sua resposta, entre em contato
                        conosco pelo formulário de contato abaixo
                    </p>

                </section>

                <section className="helpQuestions">

                    {questions.map((item, index) => (

                        <details className="helpQuestion" key={index}>

                            <summary>
                                <span>{item.question}</span>

                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m5 9 7 7 7-7" />
                                </svg>
                            </summary>

                            <div className="helpAnswer">
                                {item.answer}
                            </div>

                        </details>

                    ))}

                </section>

                <section className="helpContact">

                    <div className="helpContactSide"></div>

                    <div className="helpContactContent">

                        <h2>
                            Não conseguiu encontrar sua resposta?
                            Precisa de uma resposta mais específica?
                        </h2>

                        <p>Entre em contato conosco</p>

                        <a
                            href="mailto:contato@jpetstore.com"
                            className="helpContactButton"
                        >

                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="1" />
                                <path d="m3 6 9 7 9-7" />
                            </svg>

                            contato@jpetstore.com

                        </a>

                    </div>

                    <div className="helpContactSide"></div>

                </section>

            </main>

        </div>
    );
}

export default HelpPage;
