
import "./Cart.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import { fotoOuPadrao } from "../../services/animais";
import { aplicarCupom, obterCarrinho, removerCupom, removerDoCarrinho } from "../../services/carrinho";
import type { Carrinho } from "../../services/carrinho";
import { criarPedido } from "../../services/pedidos";
import { mensagemDeErro, naoAutenticado } from "../../services/api";

function Cart() {

    const navigate = useNavigate();
    const [carrinho, setCarrinho] = useState<Carrinho | null>(null);

    // Cada animal é único, então a quantidade é sempre 1.
    const produtos = (carrinho?.itens ?? []).map((item) => ({
        id: item.animalId,
        nome: item.nome,
        quantidade: 1,
        preco: item.precoUnitario,
        imagem: fotoOuPadrao(item.imagemUrl, item.especie)
    }));

    const [entrega, setEntrega] = useState("local");
    const [cupom, setCupom] = useState("");

    const subtotal = carrinho?.subtotal ?? 0;
    const total = carrinho?.total ?? 0;

    function mostrarErro(e: unknown): void {
        if (naoAutenticado(e)) navigate("/login");
        else alert(mensagemDeErro(e));
    }

    function receber(dados: Carrinho): void {
        setCarrinho(dados);
        setCupom(dados.cupom?.codigo ?? "");
    }

    // RF08 — Visualizar Carrinho.
    useEffect(() => {
        let ativo = true;
        obterCarrinho()
            .then((dados) => {
                if (!ativo) return;
                setCarrinho(dados);
                setCupom(dados.cupom?.codigo ?? "");
            })
            .catch((e) => {
                if (!ativo) return;
                if (naoAutenticado(e)) navigate("/login");
                else alert(mensagemDeErro(e));
            });
        return () => { ativo = false; };
    }, [navigate]);

    // RF09 — Remover animal do carrinho.
    const removerProduto = async (id: string) => {
        try {
            receber(await removerDoCarrinho(id));
        } catch (e) {
            mostrarErro(e);
        }
    };

    // RF29 — aplica o cupom digitado; com o campo vazio, retira o que estava aplicado.
    const enviarCupom = async () => {
        const codigo = cupom.trim();
        if (!codigo && !carrinho?.cupom) return;
        try {
            const dados = codigo ? await aplicarCupom(codigo) : await removerCupom();
            receber(dados);
            alert(dados.cupom ? `Cupom aplicado: ${dados.cupom.percentualDesconto}% de desconto.` : "Cupom removido.");
        } catch (e) {
            mostrarErro(e);
        }
    };

    const finalizarPedido = async () => {
        if (entrega === "entrega") {
            navigate("/AdressPayment");
            return;
        }
        try {
            await criarPedido("RETIRADA");
            alert("Pedido criado! Ele está aguardando pagamento.");
            receber(await obterCarrinho());
        } catch (e) {
            mostrarErro(e);
        }
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

                    <SearchBox />

                    <Link
                        to="/Cart"
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

                    <UserBox />

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


                                        <span>{produto.quantidade}</span>


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
                                        onClick={() => void removerProduto(produto.id)}
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

                                <button type="button" onClick={() => void enviarCupom()}>
                                    Aplicar
                                </button>

                            </div>

                        </div>

                        <div className="total">

                            <span>Total:</span>

                            <strong>{formatarPreco(total)}</strong>

                        </div>

                        <button
                            type="button"
                            className="finishOrder"
                            disabled={produtos.length === 0}
                            onClick={() => void finalizarPedido()}
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
