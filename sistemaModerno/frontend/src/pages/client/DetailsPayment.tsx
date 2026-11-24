
import "./DetailsPayment.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { obterPedido, STATUS_PEDIDO, type Pedido } from "../../services/pedidos";
import { obterPerfil, type Perfil, type DadosEndereco } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado } from "../../services/api";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
const moeda=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const rua=(e:DadosEndereco|null)=>e?[e.rua,e.numero,e.complemento].filter(Boolean).join(", "):"Não informado";

function DetailsPayment() {
    const navigate=useNavigate();
    const [params]=useSearchParams();const id=params.get("id");
    const [pedido,setPedido]=useState<Pedido|null>(null);
    const [perfil,setPerfil]=useState<Perfil|null>(null);
    const [aviso,setAviso]=useState("");
    useEffect(()=>{
        if(!id){navigate("/Orders",{replace:true});return;}
        let ativo=true;
        Promise.all([obterPedido(id),obterPerfil()]).then(([p,u])=>{if(ativo){setPedido(p);setPerfil(u);}})
            .catch(e=>{if(ativo){if(naoAutenticado(e))navigate("/login");else setAviso(mensagemDeErro(e));}});
        return ()=>{ativo=false;};
    },[id,navigate]);
    if(!pedido)return <div className="container"><p role="status">{aviso||"Carregando pedido..."}</p><Link to="/Orders">Voltar aos pedidos</Link></div>;
    const cobranca=pedido.enderecoCobranca, entrega=pedido.enderecoEntrega;
    const pagamento=pedido.pagamento;

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



            <main className="DetailsMain">

                <section className="detailsCard">

                    <div className="detailsHeader">

                        <h2>Detalhes do pedido</h2><Link to="/Orders">← Meus pedidos</Link>

                        <div className="orderCode">

                            <span>Código do pedido</span>

                            <strong>#{pedido.id.slice(0,8)}</strong>

                        </div>

                        <div className="orderStatus">

                            <span>Status</span>

                            <strong>{STATUS_PEDIDO[pedido.status]}</strong>

                        </div>

                    </div>


                    <section className="detailsSection">

                        <h3>Detalhes do pagamento:</h3>

                        <div className="paymentDetails">
                            {pagamento ? <div className="paymentInfo">
                                <p>Forma: <strong>{pagamento.forma==="CARTAO_CREDITO"?"Cartão de crédito":pagamento.forma==="PIX"?"Pix":"Boleto"}</strong></p>
                                {pagamento.ultimosDigitos && <p>Cartão: <strong>{pagamento.bandeira} •••• {pagamento.ultimosDigitos}</strong></p>}
                                <p>Data: <strong>{new Date(pagamento.dataPagamento).toLocaleString("pt-BR")}</strong></p>
                                <p>Valor: <strong>{moeda(pagamento.valor)}</strong></p><p>Pagamento de demonstração.</p>
                            </div>:<p>Nenhum pagamento registrado.</p>}
                        </div>
                    </section>



                    <section className="detailsSection">

                        <h3>Endereço de cobrança:</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    Nome: <strong>{perfil?.nome ?? ""}</strong>
                                </p>

                                <p>
                                    Sobrenome: <strong>{perfil?.sobrenome ?? ""}</strong>
                                </p>

                            </div>

                            <p>
                                Endereço: <strong>{cobranca ? rua(cobranca) : "Não informado"}</strong>
                            </p>

                            <p>
                                Bairro: <strong>{cobranca?.bairro || "—"}</strong>
                            </p>

                            <div className="addressRow addressLocation">

                                <p>
                                    Cidade: <strong>{cobranca?.cidade || "—"}</strong>
                                </p>

                                <p>
                                    Estado: <strong>{cobranca?.estado || "—"}</strong>
                                </p>

                                <p>
                                    CEP: <strong>{cobranca?.cep || "—"}</strong>
                                </p>

                                <p>
                                    País: <strong>{cobranca?.pais || "—"}</strong>
                                </p>

                            </div>

                        </div>

                    </section>



                    <section className="detailsSection">

                        <h3>Endereço de entrega:</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    Nome: <strong>{perfil?.nome ?? ""}</strong>
                                </p>

                                <p>
                                    Sobrenome: <strong>{perfil?.sobrenome ?? ""}</strong>
                                </p>

                            </div>

                            <p>
                                Endereço: <strong>{entrega ? rua(entrega) : "Retirada na loja"}</strong>
                            </p>

                            <p>
                                Bairro: <strong>{entrega?.bairro || "—"}</strong>
                            </p>

                            <div className="addressRow addressLocation">

                                <p>
                                    Cidade: <strong>{entrega?.cidade || "—"}</strong>
                                </p>

                                <p>
                                    Estado: <strong>{entrega?.estado || "—"}</strong>
                                </p>

                                <p>
                                    CEP: <strong>{entrega?.cep || "—"}</strong>
                                </p>

                                <p>
                                    País: <strong>{entrega?.pais || "—"}</strong>
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

                                    {pedido.itens.map(item=><tr key={item.animalId}><td>{item.nome}</td><td>{item.porte ?? "—"}</td><td>{item.raca ?? "—"}</td><td>{moeda(item.precoUnitario)}</td></tr>)}

                                </tbody>

                                <tfoot>

                                    <tr>
                                        <td colSpan={4}>
                                            <span>Total:</span>
                                            <strong>{moeda(pedido.valorTotal)}</strong>
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
