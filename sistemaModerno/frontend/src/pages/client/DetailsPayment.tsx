import { t, moedaLocal as moeda } from "../../services/idioma";

import "./DetailsPayment.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { obterPedido, STATUS_PEDIDO, type Pedido } from "../../services/pedidos";
import { obterPerfil, type Perfil, type DadosEndereco } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado } from "../../services/api";
import AcoesPedido from "../../components/client/AcoesPedido";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
/** Endereço 1: rua e número. Endereço 2: complemento e bairro (como no design). */
const endereco1=(e:DadosEndereco)=>[e.rua,e.numero].filter(Boolean).join(", ")||"—";
const endereco2=(e:DadosEndereco|null)=>[e?.complemento,e?.bairro].filter(Boolean).join(", ")||"—";
const FORMAS:Record<string,string>={CARTAO_CREDITO:"Cartão de crédito",PIX:"Pix",BOLETO:"Boleto"};

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
    if(!pedido)return <div className="container"><p role="status">{aviso||t("Carregando pedido...")}</p><Link to="/Orders">{t("Voltar aos pedidos")}</Link></div>;
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



            <main className="DetailsMain">

                <section className="detailsCard">

                    <div className="detailsHeader">

                        <h2>{t("Detalhes do pedido")}</h2>

                        <div className="orderCode">

                            <span>{t("Código do pedido")}</span>

                            <strong>{t("Nº")} {pedido.id.slice(0,8).toUpperCase()}</strong>

                        </div>

                        <div className="orderStatus">

                            <span>{t("Status")}</span>

                            <strong>{t(STATUS_PEDIDO[pedido.status])}</strong>

                        </div>

                    </div>


                    <section className="detailsSection">

                        <h3>{t("Detalhes do pagamento:")}</h3>

                        {pagamento?.ultimosDigitos ? (

                            <div className="paymentDetails">

                                <div className="paymentInfo">

                                    <p>
                                        {t("Bandeira do cartão:") + " "}<strong>{pagamento.bandeira}</strong>
                                    </p>

                                    <p>
                                        {t("Número do cartão:") + " "}<strong>•••• •••• •••• {pagamento.ultimosDigitos}</strong>
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div className="paymentDetails">
                                <div className="paymentInfo">
                                    <p>
                                        {pagamento
                                            ? <>{t("Forma de pagamento:") + " "}<strong>{t(FORMAS[pagamento.forma] ?? pagamento.forma)}</strong></>
                                            : t("Nenhum pagamento registrado.")}
                                    </p>
                                </div>
                            </div>

                        )}

                    </section>



                    <section className="detailsSection">

                        <h3>{t("Endereço de cobrança:")}</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    {t("Nome:") + " "}<strong>{perfil?.nome ?? ""}</strong>
                                </p>

                                <p>
                                    {t("Sobrenome:") + " "}<strong>{perfil?.sobrenome ?? ""}</strong>
                                </p>

                            </div>

                            <p>
                                {t("Endereço 1:") + " "}<strong>{cobranca ? endereco1(cobranca) : t("Não informado")}</strong>
                            </p>

                            <p>
                                {t("Endereço 2:") + " "}<strong>{endereco2(cobranca)}</strong>
                            </p>

                            <div className="addressRow addressLocation">

                                <p>
                                    {t("Cidade:") + " "}<strong>{cobranca?.cidade || "—"}</strong>
                                </p>

                                <p>
                                    {t("Estado:") + " "}<strong>{cobranca?.estado || "—"}</strong>
                                </p>

                                <p>
                                    CEP: <strong>{cobranca?.cep || "—"}</strong>
                                </p>

                                <p>
                                    {t("País:") + " "}<strong>{cobranca?.pais || "—"}</strong>
                                </p>

                            </div>

                        </div>

                    </section>



                    <section className="detailsSection">

                        <h3>{t("Endereço de entrega:")}</h3>

                        <div className="addressDetails">

                            <div className="addressRow">

                                <p>
                                    {t("Nome:") + " "}<strong>{perfil?.nome ?? ""}</strong>
                                </p>

                                <p>
                                    {t("Sobrenome:") + " "}<strong>{perfil?.sobrenome ?? ""}</strong>
                                </p>

                            </div>

                            <p>
                                {t("Endereço 1:") + " "}<strong>{entrega ? endereco1(entrega) : t("Retirada na loja")}</strong>
                            </p>

                            {entrega && (<>

                                <p>
                                    {t("Endereço 2:") + " "}<strong>{endereco2(entrega)}</strong>
                                </p>

                                <div className="addressRow addressLocation">

                                    <p>
                                        {t("Cidade:") + " "}<strong>{entrega?.cidade || "—"}</strong>
                                    </p>

                                    <p>
                                        {t("Estado:") + " "}<strong>{entrega?.estado || "—"}</strong>
                                    </p>

                                    <p>
                                        CEP: <strong>{entrega?.cep || "—"}</strong>
                                    </p>

                                    <p>
                                        {t("País:") + " "}<strong>{entrega?.pais || "—"}</strong>
                                    </p>

                                </div>
                            </>)}

                        </div>

                    </section>



                    <section className="detailsSection petsSection">

                        <h3>{t("Pet:")}</h3>

                        <div className="petsTableWrapper">

                            <table className="petsTable">

                                <thead>

                                    <tr>
                                        <th>{t("Nome")}</th>
                                        <th>{t("Porte")}</th>
                                        <th>{t("Raça")}</th>
                                        <th>{t("Preço")}</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {pedido.itens.map(item=><tr key={item.animalId}><td>{item.nome}</td><td>{item.porte ?? "—"}</td><td>{item.raca ?? "—"}</td><td>{moeda(item.precoUnitario)}</td></tr>)}

                                </tbody>

                                <tfoot>

                                    <tr>
                                        <td colSpan={4}>
                                            <span>{t("Total:")}</span>
                                            <strong>{moeda(pedido.valorTotal)}</strong>
                                        </td>
                                    </tr>

                                </tfoot>

                            </table>

                        </div>

                    </section>

                    <AcoesPedido key={pedido.id} pedido={pedido} atualizar={setPedido} />

                </section>

            </main>

        </div>

    );

}

export default DetailsPayment;
