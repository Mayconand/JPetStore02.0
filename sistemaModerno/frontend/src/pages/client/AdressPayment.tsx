import { t, moedaLocal as moeda, idiomaAtual } from "../../services/idioma";

import "./AdressPayment.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import { cadastrarEndereco, editarEndereco, listarEnderecos, cadastrarCartao } from "../../services/usuarios";
import type { DadosEndereco, Endereco } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado } from "../../services/api";
import { reutilizarEndereco } from "../../services/enderecos";

import { obterCarrinho, type Carrinho } from "../../services/carrinho";
import { criarPedido, obterPedido, pagarPedido, type Pedido } from "../../services/pedidos";
const formas = { CARTAO_CREDITO: "Cartão de crédito", PIX: "Pix", BOLETO: "Boleto" };

/** Endereço como a tela usa: rua, número e complemento em um campo só. */
interface EnderecoDaTela {
    id: string;
    pais: string;
    rua: string;
    ruaOriginal: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

const SEM_ENDERECO: EnderecoDaTela = { id: "", pais: "", rua: "", ruaOriginal: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" };

function paraTela(e: Endereco): EnderecoDaTela {
    return {
        id: e.id,
        pais: e.pais ?? "Brasil",
        rua: [e.rua, e.numero, e.complemento].filter(Boolean).join(", "),
        ruaOriginal: e.rua ?? "",
        numero: e.numero ?? "",
        complemento: e.complemento ?? "",
        bairro: e.bairro ?? "",
        cidade: e.cidade,
        estado: e.estado,
        cep: e.cep
    };
}

/** "Rua X, 10, Apto 2" -> rua, número e complemento (o que vier depois). */
function separarRua(texto: string) {
    const [rua, numero = "", ...complemento] = texto.split(",").map((parte) => parte.trim());
    return { rua, numero, complemento: complemento.join(", ") };
}

function AdressPayment() {

    const [params,setParams]=useSearchParams();
    const pedidoId=params.get("pedidoId");
    const [pedido,setPedido]=useState<Pedido|null>(null);
    const modalidade=pedido?.modalidade ?? (params.get("modalidade")==="RETIRADA"?"RETIRADA":"ENTREGA");
    const [carrinho,setCarrinho]=useState<Carrinho|null>(null);
    const [forma,setForma]=useState<keyof typeof formas>("CARTAO_CREDITO");
    const [cartaoId,setCartaoId]=useState<string>();
    const [processando,setProcessando]=useState(false);
    const trava=useRef(false);
    const voltarParaCobranca=useRef(false);
    const [aviso,setAviso]=useState("");
    const [etapa, setEtapa] = useState(1);
    const [mostrarEnderecos, setMostrarEnderecos] = useState(false);
    const [novoEndereco, setNovoEndereco] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(0);
    const [mesmoEndereco, setMesmoEndereco] = useState(true);

    const navigate = useNavigate();
    const [enderecos, setEnderecos] = useState<EnderecoDaTela[]>([]);
    const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<string | null>(null);

    // O principal vem primeiro e começa selecionado.
    useEffect(() => {
        let ativo = true;
        listarEnderecos()
            .then((lista) => {
                if (!ativo) return;
                setEnderecos(lista.map(paraTela));
                setNovoEndereco(lista.length === 0);
                setMesmoEndereco(lista.length > 0);
            })
            .catch((e) => {
                if (!ativo) return;
                if (naoAutenticado(e)) navigate("/login");
                else alert(mensagemDeErro(e));
            });
        return () => { ativo = false; };
    }, [navigate]);

    const [formEndereco, setFormEndereco] = useState({
        pais: "Brasil",
        estado: "",
        cidade: "",
        bairro: "",
        cep: "",
        complemento: ""
    });

    const [formCartao, setFormCartao] = useState({
        numero: "",
        validade: "",
        cvv: "",
        nome: "",
        cpf: ""
    });

    const [enderecoCobranca, setEnderecoCobranca] = useState({
        pais: "Brasil",
        estado: "",
        cidade: "",
        bairro: "",
        cep: "",
        complemento: ""
    });

    const selecionado=enderecos[enderecoSelecionado];
    const enderecoEntrega: DadosEndereco | undefined = pedido?.enderecoEntrega ?? (selecionado ? {
        rua:selecionado.ruaOriginal,numero:selecionado.numero,complemento:selecionado.complemento,bairro:selecionado.bairro,
        cidade:selecionado.cidade,estado:selecionado.estado,cep:selecionado.cep,pais:selecionado.pais
    } : undefined);
    const enderecoAtual = pedido?.enderecoEntrega ? paraTela({...pedido.enderecoEntrega,id:"pedido",principal:false}) : enderecos[enderecoSelecionado] ?? SEM_ENDERECO;
    const itens=pedido?.itens ?? carrinho?.itens ?? [];
    const total=pedido?.valorTotal ?? carrinho?.total ?? 0;
    const desconto=pedido?.valorDesconto ?? carrinho?.desconto ?? 0;
    useEffect(()=>{
        if(trava.current)return;
        let ativo=true;
        const carregar=async()=>{
            try{
                if(pedidoId){
                    const p=await obterPedido(pedidoId);if(!ativo)return;
                    if(p.status!=="AGUARDANDO_PAGAMENTO"){navigate("/DetailsPayment?id="+p.id,{replace:true});return;}
                    setPedido(p);setEtapa(2);
                }else{
                    const c=await obterCarrinho();if(!ativo)return;
                    setCarrinho(c);
                    if(!c.itens.length){setAviso("O carrinho está vazio.");return;}
                    if(params.get("modalidade")==="RETIRADA")setEtapa(2);
                }
            }catch(e){if(ativo){if(naoAutenticado(e))navigate("/login");else setAviso(mensagemDeErro(e));}}
        };void carregar();return()=>{ativo=false;};
    },[pedidoId,navigate,params]);

    function atualizarEndereco(e: ChangeEvent<HTMLInputElement>) {
        setFormEndereco({
            ...formEndereco,
            [e.target.name]: e.target.value
        });
    }

    function atualizarCartao(e: ChangeEvent<HTMLInputElement>) {
        setFormCartao({
            ...formCartao,
            [e.target.name]: e.target.value
        });
    }

    function atualizarCobranca(e: ChangeEvent<HTMLInputElement>) {
        setEnderecoCobranca({
            ...enderecoCobranca,
            [e.target.name]: e.target.value
        });
    }

    // RF15 / RF21 — cadastra (ou corrige) um endereço e já o seleciona para a entrega.
    async function salvarEndereco(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            const dados = { ...formEndereco, ...separarRua(formEndereco.complemento) };
            let id = enderecoEmEdicao;
            if (id) await editarEndereco(id, dados);
            else id = await cadastrarEndereco(dados);

            const lista = (await listarEnderecos()).map(paraTela);
            setEnderecos(lista);
            setEnderecoSelecionado(Math.max(0, lista.findIndex((endereco) => endereco.id === id)));
        } catch (falha) {
            if (naoAutenticado(falha)) navigate("/login");
            else alert(mensagemDeErro(falha));
            return;
        }

        setEnderecoEmEdicao(null);
        setNovoEndereco(false);
        setAviso("");
        if(voltarParaCobranca.current){
            voltarParaCobranca.current=false;
            setMesmoEndereco(true);
            setEtapa(3);
        }

        setFormEndereco({
            pais: "Brasil",
            estado: "",
            cidade: "",
            bairro: "",
            cep: "",
            complemento: ""
        });
    }

    function continuarEndereco() {
        if (novoEndereco || !enderecoAtual.id) return;

        setEtapa(2);
    }

    async function continuarPagamento(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();if(trava.current)return;
        trava.current=true;setProcessando(true);setAviso("");
        try{
            if(forma==="CARTAO_CREDITO")setCartaoId(await cadastrarCartao({numero:formCartao.numero,nomeTitular:formCartao.nome,
                dataValidade:formCartao.validade,bandeira:/^4/.test(formCartao.numero)?"VISA":/^5[1-5]/.test(formCartao.numero)?"MASTERCARD":"OUTRA"}));
            setEtapa(3);
        }catch(falha){if(naoAutenticado(falha))navigate("/login");else setAviso(mensagemDeErro(falha));}
        finally{trava.current=false;setProcessando(false);}
    }

    function dadosCobranca(): DadosEndereco {
        if(mesmoEndereco)return reutilizarEndereco(enderecoEntrega);
        const rua=separarRua(enderecoCobranca.complemento);
        if(!rua.rua||!rua.numero)throw new Error("Informe a cobrança como Rua, número, complemento.");
        return {...enderecoCobranca,...rua};
    }

    function corrigirEnderecoCadastrado() {
        const salvo=enderecos[enderecoSelecionado];
        voltarParaCobranca.current=true;
        setEnderecoEmEdicao(salvo?.id ?? null);
        setFormEndereco({
            pais:salvo?.pais ?? "Brasil",estado:salvo?.estado ?? "",cidade:salvo?.cidade ?? "",
            bairro:salvo?.bairro ?? "",cep:salvo?.cep ?? "",
            // Mantém o espaço do número vazio, sem confundir o complemento com ele.
            complemento:salvo ? `${salvo.ruaOriginal ?? ""}, ${salvo.numero ?? ""}, ${salvo.complemento ?? ""}` : ""
        });
        setMostrarEnderecos(false);
        setNovoEndereco(true);
        setEtapa(1);
        setAviso("O endereço cadastrado está sem rua ou número. Complete os dados abaixo; os outros campos já foram preenchidos.");
    }

    function confirmarCobranca() {
        try{dadosCobranca();setAviso("");setEtapa(4);}
        catch(e){
            if(mesmoEndereco)corrigirEnderecoCadastrado();
            else setAviso((e as Error).message);
        }
    }

    function finalizarCobranca(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        confirmarCobranca();
    }
    async function finalizarPedido() {
        if(trava.current||!itens.length)return;
        trava.current=true;setProcessando(true);setAviso("");
        try{
            const cobranca=dadosCobranca();
            let atual=pedido;
            if(!atual){
                if(modalidade==="ENTREGA"&&!enderecos[enderecoSelecionado]?.id)throw new Error("Selecione o endereço de entrega.");
                atual=await criarPedido(modalidade,modalidade==="ENTREGA"?enderecos[enderecoSelecionado]?.id:undefined);
                setPedido(atual);setParams({pedidoId:atual.id},{replace:true});
            }
            await pagarPedido(atual.id,forma,forma==="CARTAO_CREDITO"?cartaoId:undefined,cobranca);
            setFormCartao({numero:"",validade:"",cvv:"",nome:"",cpf:""});
            navigate("/DetailsPayment?id="+atual.id,{replace:true});
        }catch(falha){
            if(naoAutenticado(falha))navigate("/login");
            else if(mesmoEndereco&&(!enderecoEntrega?.rua?.trim()||!enderecoEntrega.numero?.trim()))corrigirEnderecoCadastrado();
            else setAviso(falha instanceof Error && !('isAxiosError' in falha)?falha.message:mensagemDeErro(falha));
        }finally{trava.current=false;setProcessando(false);}
    }

    return (

        <div className="container">

            <header className="headerClient">

                <Link to="/" className="logoLink">
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

            <main className="cartMainAdress">

                <section className="checkoutContent">

                    <div className="checkoutSteps">

                        {["ENDEREÇO", "PAGAMENTO", "CONFIRMAÇÃO"].map(
                            (nome, index) => {

                                const numero = index + 1;

                                return (

                                    <div
                                        className={`stepItem ${
                                            etapa >= numero ? "stepActive" : ""
                                        }`}
                                        key={nome}
                                    >

                                        <strong>{t(nome)}</strong>

                                        <div className="stepCircle">
                                            {etapa > numero ? "✓" : numero === 3 && etapa === 4 ? "✓" : ""}
                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                    {aviso && <p role="alert">{t(aviso)}</p>}
                    <p>{t("Pagamento de demonstração. Use dados fictícios.")}</p>
                    {etapa === 1 && (

                        <section className="checkoutCard">

                            {!novoEndereco ? (

                                <>

                                    <div className="deliveryTitle">
                                        <span className="material-symbols-outlined">location_on</span>
                                        {t("Endereço de entrega")}
                                    </div>

                                    <div className="selectedAddress">

                                        <span className="addressText">
                                            {enderecoAtual.rua} - {enderecoAtual.bairro},
                                            {" "}{enderecoAtual.cidade} - {enderecoAtual.estado},
                                            {" "}{enderecoAtual.cep}
                                        </span>

                                        <div className="addressActions">

                                            <button
                                                type="button"
                                                className="btnChange"
                                                onClick={() => setMostrarEnderecos(true)}
                                            >
                                                {t("Trocar")}
                                            </button>

                                            <button
                                                type="button"
                                                className="btnNew"
                                                onClick={() => {
                                                    setEnderecoEmEdicao(null);
                                                    setNovoEndereco(true);
                                                }}
                                            >
                                                {t("+ Novo")}
                                            </button>

                                        </div>

                                    </div>

                                    <div className="checkoutButtons">

                                        <button
                                            type="button"
                                            className="btnContinue"
                                            onClick={continuarEndereco}
                                        >
                                            {t("Continuar")}
                                        </button>

                                    </div>

                                </>

                            ) : (

                                <>

                                    <div className="deliveryTitle">
                                       <span className="material-symbols-outlined">location_on</span>{" " + t("Novo endereço de entrega")}
                                    </div>

                                    <form onSubmit={(e) => void salvarEndereco(e)}>

                                        <div className="formGrid">

                                            <div className="formGroup">
                                                <label>{t("País")}</label>
                                                <input
                                                    name="pais"
                                                    value={formEndereco.pais}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>{t("Estado")}</label>
                                                <input
                                                    name="estado"
                                                    value={formEndereco.estado}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>{t("Cidade")}</label>
                                                <input
                                                    name="cidade"
                                                    value={formEndereco.cidade}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>{t("Bairro")}</label>
                                                <input
                                                    name="bairro"
                                                    value={formEndereco.bairro}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>CEP</label>
                                                <input
                                                    name="cep"
                                                    value={formEndereco.cep}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup formWide">
                                                <label>{t("Rua, número e complemento")}</label>
                                                <input
                                                    name="complemento"
                                                    value={formEndereco.complemento}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                        </div>

                                        <div className="formActions">

                                            <button
                                                type="button"
                                                className="btnBack"
                                                onClick={() => setNovoEndereco(false)}
                                            >
                                                {t("Cancelar")}
                                            </button>

                                            <button
                                                type="submit"
                                                className="btnContinue"
                                            >
                                                {t("Salvar endereço")}
                                            </button>

                                        </div>

                                    </form>

                                </>

                            )}

                        </section>

                    )}

                    {etapa === 2 && (

                        <section className="checkoutCard">

                            <div className="deliveryTitle">
                                <span>ⓢ</span>
                                {t("Método de pagamento")}
                            </div>

                            <form onSubmit={continuarPagamento}>

                                <label>{t("Forma de pagamento") + " "}<select value={forma} onChange={e=>setForma(e.target.value as keyof typeof formas)}>
                                    {Object.entries(formas).map(([codigo,nome])=><option key={codigo} value={codigo}>{t(nome)}</option>)}
                                </select></label>
                                {forma === "CARTAO_CREDITO" && (<>
                                <div className="formGrid paymentGrid">

                                    <div className="formGroup paymentNumber">
                                        <label>{t("Número do cartão")}</label>
                                        <input
                                            name="numero"
                                            value={formCartao.numero}
                                            onChange={atualizarCartao}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            required
                                        />
                                    </div>

                                    <div className="formGroup">
                                        <label>{t("Data de vencimento")}</label>
                                        <input
                                            name="validade"
                                            value={formCartao.validade}
                                            onChange={atualizarCartao}
                                            placeholder="MM/AA"
                                            maxLength={5}
                                            required
                                        />
                                    </div>

                                    <div className="formGroup">
                                        <label>CVV</label>
                                        <input
                                            name="cvv"
                                            value={formCartao.cvv}
                                            onChange={atualizarCartao}
                                            placeholder="000"
                                            maxLength={4}
                                        />
                                    </div>

                                    <div className="formGroup">
                                        <label>{t("Nome no cartão")}</label>
                                        <input
                                            name="nome"
                                            value={formCartao.nome}
                                            onChange={atualizarCartao}
                                            required
                                        />
                                    </div>

                                    <div className="formGroup">
                                        <label>CPF</label>
                                        <input
                                            name="cpf"
                                            value={formCartao.cpf}
                                            onChange={atualizarCartao}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>

                                </div>
                                </>)}

                                <div className="checkoutButtons">

                                    <button
                                        type="button"
                                        className="btnBack"
                                        onClick={() => pedidoId ? navigate("/Orders") : setEtapa(1)}
                                    >
                                        {t("Voltar")}
                                    </button>

                                    <button
                                        type="submit"
                                        className="btnContinue"
                                    >
                                        {t("Continuar")}
                                    </button>

                                </div>

                            </form>

                        </section>

                    )}


                    {etapa === 3 && (

                        <section className="checkoutCard">

                            <div className="deliveryTitle">
                                <span className="material-symbols-outlined">location_on</span>{" " + t("Endereço de entrega")}
                            </div>

                            <h4 className="billingTitle">
                                {t("Endereço de cobrança:")}
                            </h4>

                            <label className="sameAddress">
                                <input
                                    type="checkbox"
                                    checked={mesmoEndereco}
                                    onChange={(e) => setMesmoEndereco(e.target.checked)}
                                />
                                {modalidade === "RETIRADA" ? t("Utilizar o endereço cadastrado") : t("Utilizar o mesmo endereço de entrega")}
                            </label>

                            {!mesmoEndereco && (

                                <form onSubmit={finalizarCobranca}>

                                    <div className="formGrid">

                                        <div className="formGroup">
                                            <label>{t("País")}</label>
                                            <input
                                                name="pais"
                                                value={enderecoCobranca.pais}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>{t("Estado")}</label>
                                            <input
                                                name="estado"
                                                value={enderecoCobranca.estado}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>{t("Cidade")}</label>
                                            <input
                                                name="cidade"
                                                value={enderecoCobranca.cidade}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>{t("Bairro")}</label>
                                            <input
                                                name="bairro"
                                                value={enderecoCobranca.bairro}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>CEP</label>
                                            <input
                                                name="cep"
                                                value={enderecoCobranca.cep}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>{t("Rua, número, complemento")}</label>
                                            <input
                                                name="complemento"
                                                value={enderecoCobranca.complemento}
                                                onChange={atualizarCobranca}
                                            />
                                        </div>

                                    </div>

                                    <div className="checkoutButtons">

                                        <button
                                            type="button"
                                            className="btnBack"
                                            onClick={() => setEtapa(2)}
                                        >
                                            {t("Voltar")}
                                        </button>

                                        <button
                                            type="submit"
                                            className="btnContinue"
                                        >
                                            {t("Continuar")}
                                        </button>

                                    </div>

                                </form>

                            )}

                            {mesmoEndereco && (

                                <div className="checkoutButtons">

                                    <button
                                        type="button"
                                        className="btnBack"
                                        onClick={() => setEtapa(2)}
                                    >
                                        {t("Voltar")}
                                    </button>

                                    <button
                                        type="button"
                                        className="btnContinue"
                                        onClick={confirmarCobranca}
                                    >
                                        {t("Continuar")}
                                    </button>

                                </div>

                            )}

                        </section>

                    )}

                    {etapa === 4 && (

                        <section className="checkoutCard confirmationCard">

                            <div className="confirmationIcon">✓</div>

                            <h3>{t("Pedido pronto para confirmação!")}</h3>

                            <p>
                                {t("Confira os dados do seu pedido antes de finalizar.")}
                            </p>

                            <div className="confirmationDetails">
                                <strong>{modalidade === "RETIRADA" ? t("Retirada:") : t("Endereço de entrega:")}</strong>
                                <span>
                                    {modalidade === "RETIRADA" ? t("Retirada na loja") : `${enderecoAtual.rua}, ${enderecoAtual.bairro} - ${enderecoAtual.cidade}/${enderecoAtual.estado}`}
                                </span>

                                <strong>{t("Forma de pagamento:")}</strong>
                                <span>{t(formas[forma])}</span>
                            </div>

                            <button
                                type="button"
                                className="btnContinue"
                                disabled={processando || !itens.length}
                                onClick={() => void finalizarPedido()}
                            >
                                {processando ? t("Processando...") : t("Finalizar pedido")}
                            </button>

                        </section>

                    )}

                </section>

                <aside className="orderSummary">
                    <h3>{pedido ? t("Resumo - Pedido #") + pedido.id.slice(0,8) : t("Resumo do pedido")}</h3>
                    {pedido && <div className="summaryLine"><span>{t("Data:")}</span><span>{new Date(pedido.dataCriacao).toLocaleString(idiomaAtual())}</span></div>}
                    <div className="summaryProducts"><strong>Pets</strong>{itens.map(item=><div className="summaryLine" key={item.animalId}><span>{item.nome}</span><span>{moeda(item.precoUnitario)}</span></div>)}</div>
                    {desconto>0 && <div className="summaryLine"><span>{t("Desconto:")}</span><span>{moeda(desconto)}</span></div>}
                    <div className="summaryTotal"><span>{t("Total:")}</span><strong>{moeda(total)}</strong></div>
                </aside>

            </main>

            {mostrarEnderecos && (

                <div
                    className="addressModalOverlay"
                    onClick={() => setMostrarEnderecos(false)}
                >

                    <div
                        className="addressModal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modalHeader">

                            <h3>{t("Endereço")}</h3>

                            <button
                                type="button"
                                onClick={() => setMostrarEnderecos(false)}
                            >
                                ×
                            </button>

                        </div>

                        <div className="modalAddressList">

                            {enderecos.map((endereco, index) => (

                                <div className="modalAddressItem" key={index}>

                                    <input
                                        type="radio"
                                        name="endereco"
                                        checked={enderecoSelecionado === index}
                                        onChange={() => setEnderecoSelecionado(index)}
                                    />

                                    <div className="modalAddressInfo">

                                        <p>
                                            {endereco.rua} - {endereco.bairro},
                                            {" "}{endereco.cidade} - {endereco.estado},
                                            {" "}{endereco.cep}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEnderecoSelecionado(index);
                                                setMostrarEnderecos(false);
                                                setNovoEndereco(true);
                                                setEnderecoEmEdicao(endereco.id);
                                                setFormEndereco({
                                                    pais: endereco.pais,
                                                    estado: endereco.estado,
                                                    cidade: endereco.cidade,
                                                    bairro: endereco.bairro,
                                                    cep: endereco.cep,
                                                    complemento: endereco.rua
                                                });
                                            }}
                                        >
                                            {t("Editar")}
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                        <div className="modalFooter">

                            <button
                                type="button"
                                className="btnContinue"
                                onClick={() => setMostrarEnderecos(false)}
                            >
                                {t("Confirmar endereço")}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default AdressPayment;
