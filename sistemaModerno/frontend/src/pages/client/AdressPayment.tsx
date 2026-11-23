
import "./AdressPayment.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import { cadastrarEndereco, editarEndereco, listarEnderecos } from "../../services/usuarios";
import type { Endereco } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado } from "../../services/api";

/** Endereço como a tela usa: rua, número e complemento em um campo só. */
interface EnderecoDaTela {
    id: string;
    pais: string;
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

const SEM_ENDERECO: EnderecoDaTela = { id: "", pais: "", rua: "", bairro: "", cidade: "", estado: "", cep: "" };

function paraTela(e: Endereco): EnderecoDaTela {
    return {
        id: e.id,
        pais: e.pais ?? "Brasil",
        rua: [e.rua, e.numero, e.complemento].filter(Boolean).join(", "),
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

    const [etapa, setEtapa] = useState(1);
    const [mostrarEnderecos, setMostrarEnderecos] = useState(false);
    const [novoEndereco, setNovoEndereco] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(0);
    const [mesmoEndereco, setMesmoEndereco] = useState(false);

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

    const enderecoAtual = enderecos[enderecoSelecionado] ?? SEM_ENDERECO;

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

    function continuarPagamento(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setEtapa(3);
    }

    function finalizarCobranca(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setEtapa(4);
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

                                        <strong>{nome}</strong>

                                        <div className="stepCircle">
                                            {etapa > numero ? "✓" : numero === 3 && etapa === 4 ? "✓" : ""}
                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                    {etapa === 1 && (

                        <section className="checkoutCard">

                            {!novoEndereco ? (

                                <>

                                    <div className="deliveryTitle">
                                        <span className="material-symbols-outlined">location_on</span>
                                        Endereço de entrega
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
                                                Trocar
                                            </button>

                                            <button
                                                type="button"
                                                className="btnNew"
                                                onClick={() => {
                                                    setEnderecoEmEdicao(null);
                                                    setNovoEndereco(true);
                                                }}
                                            >
                                                + Novo
                                            </button>

                                        </div>

                                    </div>

                                    <div className="checkoutButtons">

                                        <button
                                            type="button"
                                            className="btnContinue"
                                            onClick={continuarEndereco}
                                        >
                                            Continuar
                                        </button>

                                    </div>

                                </>

                            ) : (

                                <>

                                    <div className="deliveryTitle">
                                       <span className="material-symbols-outlined">location_on</span> Novo endereço de entrega
                                    </div>

                                    <form onSubmit={(e) => void salvarEndereco(e)}>

                                        <div className="formGrid">

                                            <div className="formGroup">
                                                <label>País</label>
                                                <input
                                                    name="pais"
                                                    value={formEndereco.pais}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>Estado</label>
                                                <input
                                                    name="estado"
                                                    value={formEndereco.estado}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>Cidade</label>
                                                <input
                                                    name="cidade"
                                                    value={formEndereco.cidade}
                                                    onChange={atualizarEndereco}
                                                    required
                                                />
                                            </div>

                                            <div className="formGroup">
                                                <label>Bairro</label>
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
                                                <label>Rua, número e complemento</label>
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
                                                Cancelar
                                            </button>

                                            <button
                                                type="submit"
                                                className="btnContinue"
                                            >
                                                Salvar endereço
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
                                Método de pagamento
                            </div>

                            <form onSubmit={continuarPagamento}>

                                <div className="formGrid paymentGrid">

                                    <div className="formGroup paymentNumber">
                                        <label>Número do cartão</label>
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
                                        <label>Data de vencimento</label>
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
                                            required
                                        />
                                    </div>

                                    <div className="formGroup">
                                        <label>Nome no cartão</label>
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
                                            required
                                        />
                                    </div>

                                </div>

                                <div className="checkoutButtons">

                                    <button
                                        type="button"
                                        className="btnBack"
                                        onClick={() => setEtapa(1)}
                                    >
                                        Voltar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btnContinue"
                                    >
                                        Continuar
                                    </button>

                                </div>

                            </form>

                        </section>

                    )}


                    {etapa === 3 && (

                        <section className="checkoutCard">

                            <div className="deliveryTitle">
                                <span className="material-symbols-outlined">location_on</span> Endereço de entrega
                            </div>

                            <h4 className="billingTitle">
                                Endereço de cobrança do cartão:
                            </h4>

                            <label className="sameAddress">
                                <input
                                    type="checkbox"
                                    checked={mesmoEndereco}
                                    onChange={(e) => setMesmoEndereco(e.target.checked)}
                                />
                                Utilizar o mesmo endereço de entrega
                            </label>

                            {!mesmoEndereco && (

                                <form onSubmit={finalizarCobranca}>

                                    <div className="formGrid">

                                        <div className="formGroup">
                                            <label>País</label>
                                            <input
                                                name="pais"
                                                value={enderecoCobranca.pais}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>Estado</label>
                                            <input
                                                name="estado"
                                                value={enderecoCobranca.estado}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>Cidade</label>
                                            <input
                                                name="cidade"
                                                value={enderecoCobranca.cidade}
                                                onChange={atualizarCobranca}
                                                required
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label>Bairro</label>
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
                                            <label>Complemento</label>
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
                                            Voltar
                                        </button>

                                        <button
                                            type="submit"
                                            className="btnContinue"
                                        >
                                            Continuar
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
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        className="btnContinue"
                                        onClick={() => setEtapa(4)}
                                    >
                                        Continuar
                                    </button>

                                </div>

                            )}

                        </section>

                    )}

                    {etapa === 4 && (

                        <section className="checkoutCard confirmationCard">

                            <div className="confirmationIcon">✓</div>

                            <h3>Pedido pronto para confirmação!</h3>

                            <p>
                                Confira os dados do seu pedido antes de finalizar.
                            </p>

                            <div className="confirmationDetails">
                                <strong>Endereço de entrega:</strong>
                                <span>
                                    {enderecoAtual.rua}, {enderecoAtual.bairro} -
                                    {" "}{enderecoAtual.cidade}/{enderecoAtual.estado}
                                </span>

                                <strong>Forma de pagamento:</strong>
                                <span>Cartão de crédito</span>
                            </div>

                            <button
                                type="button"
                                className="btnContinue"
                            >
                                Finalizar pedido
                            </button>

                        </section>

                    )}

                </section>

                <aside className="orderSummary">

                    <h3>Resumo - Pedido Nº 1000</h3>

                    <div className="summaryLine">
                        <span>Dia:</span>
                        <span>00/00/0000</span>
                    </div>

                    <div className="summaryLine">
                        <span>Hora:</span>
                        <span>00:00</span>
                    </div>

                    <div className="summaryProducts">

                        <strong>Pets</strong>

                        <div className="summaryLine">
                            <span>Nome do animal</span>
                            <span>R$ 4.000</span>
                        </div>

                    </div>

                    <div className="summaryTotal">
                        <span>Total:</span>
                        <strong>R$ 4.000</strong>
                    </div>

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

                            <h3>Endereço</h3>

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
                                            Editar
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
                                Confirmar endereço
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default AdressPayment;
