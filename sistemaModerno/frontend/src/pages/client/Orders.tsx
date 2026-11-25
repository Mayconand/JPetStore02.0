import { t, moedaLocal as moeda, idiomaAtual } from "../../services/idioma";

import "./Orders.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { listarPedidos, obterPedido, STATUS_PEDIDO, type Pedido } from "../../services/pedidos";
import { mensagemDeErro, naoAutenticado, urlDoArquivo } from "../../services/api";
import AcoesPedido from "../../components/client/AcoesPedido";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";

function Orders() {
    const navigate=useNavigate();
    const [pedidos,setPedidos]=useState<Pedido[]>([]);
    const [aviso,setAviso]=useState("Carregando pedidos...");
    useEffect(()=>{
        let ativo=true;
        listarPedidos().then(lista=>Promise.all(lista.map(p=>obterPedido(p.id)))).then(lista=>{if(ativo){setPedidos(lista);setAviso("");}})
            .catch(e=>{if(ativo){if(naoAutenticado(e))navigate("/login");else setAviso(mensagemDeErro(e));}});
        return ()=>{ativo=false;};
    },[navigate]);

    function atualizarPedido(atualizado: Pedido) {
        setPedidos(lista => lista.map(pedido => pedido.id === atualizado.id ? atualizado : pedido));
    }

    return (

        <div className="container detailsPaymentPage">

            <header className="headerClient">

                <Link to="/HomeClient" className="logoLink">

                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />

                </Link>

                <nav className="headerNav">

                    <SearchBox />

                    <Link
                        to="/Cart"
                        className="headerIcon"
                        aria-label={t("Carrinho")}
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

            <main className="OrdersMain">

                <section className="ordersContent">

                    <h1 className="ordersTitle">
                        {t("Seus Pedidos")}
                    </h1>

                    <div className="ordersList">

                        {aviso && <p role="status">{t(aviso)}</p>}
                        {!aviso && !pedidos.length && <p>{t("Você ainda não tem pedidos.")}</p>}
                        {pedidos.map(pedido=><article className="orderCard" key={pedido.id}>

                            <div className="orderHeader">

                                <div className="orderIdentification">

                                    <span className="material-symbols-outlined">pets</span>

                                    <h2>{t("Pedido #")}{pedido.id.slice(0,8)}</h2>

                                </div>

                                <button
                                    type="button"
                                    className="orderOptions"
                                    aria-label={t("Detalhes do pedido")} onClick={()=>navigate("/DetailsPayment?id="+pedido.id)}
                                >
                                    ...
                                </button>

                            </div>

                            <p>{t(STATUS_PEDIDO[pedido.status])}</p>
                            <AcoesPedido pedido={pedido} atualizar={atualizarPedido} />
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
                                        {pedido.modalidade==="RETIRADA" ? t("Retirada na loja") : [pedido.enderecoEntrega?.rua,pedido.enderecoEntrega?.numero,pedido.enderecoEntrega?.cidade,pedido.enderecoEntrega?.estado].filter(Boolean).join(", ")}
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
                                        {new Date(pedido.dataCriacao).toLocaleString(idiomaAtual())}
                                    </span>

                                </div>

                            </div>

                            {pedido.itens.map(item=><div className="orderProduct" key={item.animalId}>
                                <div className="orderProductImage">{item.imagemUrl && <img src={urlDoArquivo(item.imagemUrl)} alt={item.nome} style={{width:"100%",height:"100%",objectFit:"cover"}} />}</div>
                                <div className="orderProductDetails"><span>{item.nome}</span><span>{item.raca ?? ""}</span><span>{item.porte ?? ""}</span><strong>{moeda(item.precoUnitario)}</strong></div>
                            </div>)}
                            <div className="orderTotal">

                                <span>{t("Total:")}</span>
                                <strong>{moeda(pedido.valorTotal)}</strong>

                            </div>

                        </article>)}

                    </div>

                </section>

            </main>

        </div>

    );

}

export default Orders;
