
import "./Orders.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link } from "react-router-dom";

function DetailsPayment() {

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

                <nav className="headerNav">

                    <div className="searchBox">

                        <input
                            type="text"
                            placeholder="Buscar"
                            aria-label="Buscar animais"
                        />

                        <button type="button" aria-label="Pesquisar">

                            <svg viewBox="0 0 24 24" fill="none">

                                <circle
                                    cx="10.8"
                                    cy="10.8"
                                    r="6.8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />

                                <path
                                    d="M16 16L21 21"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />

                            </svg>

                        </button>

                    </div>

                    <Link
                        to="/carrinho"
                        className="headerIcon"
                        aria-label="Carrinho"
                    >

                        <svg viewBox="0 0 24 24" fill="none">

                            <path
                                d="M2 3H4L7 16H19L22 6H5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                            <circle cx="18" cy="20" r="1.5" fill="currentColor" />

                        </svg>

                    </Link>

                    <div className="userBox">

                        <svg viewBox="0 0 24 24" fill="none">

                            <circle
                                cx="12"
                                cy="8"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />

                            <path
                                d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                        </svg>

                        <span>
                            <strong>Nome:</strong> Fulano
                        </span>

                    </div>

                </nav>

            </header>

            <main className="OrdersMain">

                <section className="ordersContent">

                    <h1 className="ordersTitle">
                        Seus Pedidos
                    </h1>

                    <div className="ordersList">

                        <article className="orderCard">

                            <div className="orderHeader">

                                <div className="orderIdentification">

                                    <span className="material-symbols-outlined">pets</span>

                                    <h2>Pedido Nº1000</h2>

                                </div>

                                <button
                                    type="button"
                                    className="orderOptions"
                                    aria-label="Opções do pedido"
                                >
                                    ...
                                </button>

                            </div>

                            <div className="orderInfo">

                                <div className="orderAddress">

                                    <svg viewBox="0 0 24 24" fill="none">

                                        <path
                                            d="M20 10C20 15 12 22 12 22S4 15 4 10A8 8 0 1 1 20 10Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />

                                        <circle
                                            cx="12"
                                            cy="10"
                                            r="2.5"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />

                                    </svg>

                                    <span>
                                        R. Prof. Plínio Garcez de Sena, 42 - Mussurunga, Salvador - BA, 41480-225
                                    </span>

                                </div>

                                <div className="orderDate">

                                    <svg viewBox="0 0 24 24" fill="none">

                                        <rect
                                            x="3"
                                            y="5"
                                            width="18"
                                            height="16"
                                            rx="2"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        />

                                        <path
                                            d="M7 3V7M17 3V7M3 10H21"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M12 13V16L14 17"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />

                                    </svg>

                                    <span>
                                        00/00/0000 às 00:00
                                    </span>

                                </div>

                            </div>

                            <div className="orderProduct">

                                <div className="orderProductImage">
                                    
                                </div>

                                <div className="orderProductDetails">

                                    <span>Nome do animal</span>
                                    <span>Raça X</span>
                                    <span>Porte Y</span>
                                    <strong>R$ 4.000</strong>

                                </div>

                            </div>

                            <div className="orderTotal">

                                <span>Total:</span>
                                <strong>R$ 4.000</strong>

                            </div>

                        </article>

                    </div>

                </section>

            </main>

        </div>

    );

}

export default DetailsPayment;
