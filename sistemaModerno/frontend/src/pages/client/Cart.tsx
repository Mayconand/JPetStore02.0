
import "./Cart.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link } from "react-router-dom";
import { useState } from "react";

function Cart() {

    const [produtos, setProdutos] = useState([
        {
            id: 1,
            nome: "Nome do animal",
            quantidade: 2,
            preco: 2500,
            imagem: null
        },
        {
            id: 2,
            nome: "Nome do animal",
            quantidade: 1,
            preco: 1500,
            imagem: null
        }
    ]);

    const [entrega, setEntrega] = useState("local");
    const [cupom, setCupom] = useState("");

    const subtotal = produtos.reduce(
        (total, produto) =>
            total + produto.preco * produto.quantidade,
        0
    );

    const removerProduto = (id: number) => {
        setProdutos(produtos.filter(produto => produto.id !== id));
    };


    const alterarQuantidade = (id: number, operacao: "adicionar" | "diminuir") => {
        setProdutos(produtos.map(produto => {
            if (produto.id === id) {
                const novaQuantidade =
                    operacao === "adicionar"
                        ? produto.quantidade + 1
                        : Math.max(1, produto.quantidade - 1);

                return {
                    ...produto,
                    quantidade: novaQuantidade
                };
            }

            return produto;
        }));
    };


    const formatarPreco = (valor: number): string => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };

    return (

        <div className="container">

            <header className="headerClient">

                <img
                    src={logo}
                    alt="Logo JPetStore"
                    className="logo"
                />

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

            <main className="cartMain">

                <h1>Carrinho</h1>

                <div className="cartContent">

                    <section className="opcoesconteiner">

                        <div className="cartTableHeader">
                            <span>Nome</span>
                            <span>QTD.</span>
                            <span>VALOR</span>
                            <span></span>
                        </div>

                        {produtos.length > 0 ? (

                            produtos.map(produto => (

                                <div className="cartProduct" key={produto.id}>

                                    <div className="productInfoCart">

                                        <div className="productImageCart">
                                            {produto.imagem && (
                                                <img
                                                    src={produto.imagem}
                                                    alt={produto.nome}
                                                />
                                            )}
                                        </div>

                                        <span>{produto.nome}</span>

                                    </div>

                                    
                                    <div className="productQuantity">

                                        <button
                                            type="button"
                                            className="quantityButton"
                                            onClick={() => alterarQuantidade(produto.id, "diminuir")}
                                            disabled={produto.quantidade <= 1}
                                            aria-label="Diminuir quantidade"
                                        >
                                            -
                                        </button>

                                        <span>{produto.quantidade}</span>

                                        <button
                                            type="button"
                                            className="quantityButton"
                                            onClick={() => alterarQuantidade(produto.id, "adicionar")}
                                            aria-label="Aumentar quantidade"
                                        >
                                            +
                                        </button>

                                    </div>


                                    <span className="productPrice">
                                        {formatarPreco(
                                            produto.preco * produto.quantidade
                                        )}
                                    </span>

                                    <button
                                        type="button"
                                        className="removeProduct"
                                        aria-label={`Remover ${produto.nome}`}
                                        onClick={() => removerProduto(produto.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M4 7H20M10 11V17M14 11V17M5 7L6 20H18L19 7M9 7V4H15V7"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                </div>

                            ))

                        ) : (

                            <p className="emptyCart">
                                Seu carrinho está vazio.
                            </p>

                        )}

                    </section>

                    <section className="resumoconteiner">

                        <h2>Resumo</h2>

                        <div className="deliveryOption">

                            <label htmlFor="entrega">
                                Opção de Entrega:
                            </label>

                            <select
                                id="entrega"
                                value={entrega}
                                onChange={(e) => setEntrega(e.target.value)}
                            >
                                <option value="local">
                                    Retirar no local
                                </option>

                                <option value="entrega">
                                    Entrega em domicílio
                                </option>
                            </select>

                        </div>

                        <div className="subtotal">

                            <span>Subtotal:</span>

                            <span>{formatarPreco(subtotal)}</span>

                        </div>

                        <div className="couponSection">

                            <label htmlFor="cupom">
                                Cupom promocional:
                            </label>

                            <div className="couponInput">

                                <input
                                    type="text"
                                    id="cupom"
                                    value={cupom}
                                    onChange={(e) => setCupom(e.target.value)}
                                />

                                <button type="button">
                                    Aplicar
                                </button>

                            </div>

                        </div>

                        <div className="total">

                            <span>Total:</span>

                            <strong>{formatarPreco(subtotal)}</strong>

                        </div>

                        <button
                            type="button"
                            className="finishOrder"
                            disabled={produtos.length === 0}
                        >
                            Finalizar o pedido
                        </button>

                    </section>

                </div>

            </main>

        </div>

    );
}

export default Cart;
