
import "./AdressPayment.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { Link } from "react-router-dom";

function AdressPayment() {

    const [etapa, setEtapa] = useState(1);
    const [mostrarEnderecos, setMostrarEnderecos] = useState(false);
    const [novoEndereco, setNovoEndereco] = useState(false);
    const [enderecoSelecionado, setEnderecoSelecionado] = useState(0);
    const [mesmoEndereco, setMesmoEndereco] = useState(false);

    const [enderecos, setEnderecos] = useState([
        {
            rua: "R. Prof. Plínio Garcez de Sena, 42",
            bairro: "Mussurunga",
            cidade: "Salvador",
            estado: "BA",
            cep: "41480-225"
        },
        {
            rua: "Praça Stella Maris, 200",
            bairro: "Stella Maris",
            cidade: "Salvador",
            estado: "BA",
            cep: "41600-500"
        }
    ]);

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

    const enderecoAtual = enderecos[enderecoSelecionado];

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

    function salvarEndereco(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const novo = {
            rua: formEndereco.complemento || "Novo endereço",
            bairro: formEndereco.bairro,
            cidade: formEndereco.cidade,
            estado: formEndereco.estado,
            cep: formEndereco.cep
        };

        setEnderecos([...enderecos, novo]);
        setEnderecoSelecionado(enderecos.length);
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
        if (novoEndereco) return;

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
                                                onClick={() => setNovoEndereco(true)}
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

                                    <form onSubmit={salvarEndereco}>

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
                                                setFormEndereco({
                                                    pais: "Brasil",
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
