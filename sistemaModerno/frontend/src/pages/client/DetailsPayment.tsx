
import "./DetailsPayment.css";

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



            <main className="DetailsMain">

                <section className="detailsCard">

                    <div className="detailsHeader">

                        <h2>Detalhes do pedido</h2>

                        <div className="orderCode">

                            <span>Código do pedido</span>

                            <strong>Nº 1000</strong>

                        </div>

                        <div className="orderStatus">

                            <span>Status</span>

                            <strong>Preparação</strong>

                        </div>

                    </div>


                    <section className="detailsSection">

                        <h3>Detalhes do pagamento:</h3>

                        <div className="paymentDetails">

                            <div className="paymentInfo">

                                <p>
                                    Bandeira do cartão: <strong>Visa</strong>
                                </p>

                                <p>
                                    Número do cartão: <strong>0000 0000 0000 0000</strong>
                                </p>

                            </div>

                            <p className="expirationDate">
                                Data de vencimento: <strong>00/00</strong>
                            </p>

                        </div>

                    </section>



                    <section className="detailsSection">

                        <h3>Endereço de cobrança:</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    Nome: <strong>ABC</strong>
                                </p>

                                <p>
                                    Sobrenome: <strong>XYZ</strong>
                                </p>

                            </div>

                            <p>
                                Endereço 1: <strong>XXX,XXXX,XXXXXXXXXXXXXXX</strong>
                            </p>

                            <p>
                                Endereço 2: <strong>YYY,YYYY,YYYYYYYYYYYYYYYYYYYY</strong>
                            </p>

                            <div className="addressRow addressLocation">

                                <p>
                                    Cidade: <strong>ABC</strong>
                                </p>

                                <p>
                                    Estado: <strong>ABC</strong>
                                </p>

                                <p>
                                    CEP: <strong>00000-000</strong>
                                </p>

                                <p>
                                    País: <strong>ABC</strong>
                                </p>

                            </div>

                        </div>

                    </section>



                    <section className="detailsSection">

                        <h3>Endereço de entrega:</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    Nome: <strong>ABC</strong>
                                </p>

                                <p>
                                    Sobrenome: <strong>XYZ</strong>
                                </p>

                            </div>

                            <p>
                                Endereço 1: <strong>XXX,XXXX,XXXXXXXXXXXXXXX</strong>
                            </p>

                            <p>
                                Endereço 2: <strong>YYY,YYYY,YYYYYYYYYYYYYYYYYYYY</strong>
                            </p>

                            <div className="addressRow addressLocation">

                                <p>
                                    Cidade: <strong>ABC</strong>
                                </p>

                                <p>
                                    Estado: <strong>ABC</strong>
                                </p>

                                <p>
                                    CEP: <strong>00000-000</strong>
                                </p>

                                <p>
                                    País: <strong>ABC</strong>
                                </p>

                            </div>

                        </div>

                    </section>



                    <section className="detailsSection petsSection">

                        <h3>Pet:</h3>

                        <div className="petsTableWrapper">

                            <table className="petsTable">

                                <thead>

                                    <tr>
                                        <th>Nome</th>
                                        <th>Porte</th>
                                        <th>Raça</th>
                                        <th>Preço</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    <tr>
                                        <td>ABC</td>
                                        <td>Medio</td>
                                        <td>XXXXXXXX</td>
                                        <td>R$ 4.000</td>
                                    </tr>

                                </tbody>

                                <tfoot>

                                    <tr>
                                        <td colSpan={4}>
                                            <span>Total:</span>
                                            <strong>R$ 4.000</strong>
                                        </td>
                                    </tr>

                                </tfoot>

                            </table>

                        </div>

                    </section>

                </section>

            </main>

        </div>

    );

}

export default DetailsPayment;
