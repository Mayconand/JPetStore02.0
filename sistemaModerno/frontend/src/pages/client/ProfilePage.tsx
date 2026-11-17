
import { useState, type ChangeEvent, type FormEvent } from "react";
import "./ProfilePage.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { Link } from "react-router-dom";

function ProfilePage() {

    const [semSegundoEndereco, setSemSegundoEndereco] = useState(false);
    const [minhaLista, setMinhaLista] = useState(false);
    const [meuBanner, setMeuBanner] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        sobrenome: "",
        email: "",
        telefone: "",
        cidade1: "",
        estado1: "",
        pais1: "",
        cep1: "",
        complemento1: "",
        pais2: "",
        estado2: "",
        cidade2: "",
        cep2: "",
        complemento2: "",
        idioma: "",
        categoria: ""
    });

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const dados = {
            ...formData,
            semSegundoEndereco,
            minhaLista,
            meuBanner
        };

        console.log("Dados do perfil:", dados);
        alert("Informações salvas com sucesso!");
    }

    return (
        <div className="container detailsPaymentPage profilePage">

            <header className="headerClient profileHeader">

                <Link to="/" className="logoLink">
                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />
                </Link>

                <div className="profileHeaderActions">

                    <div className="profileSearch">
                        <input
                            type="text"
                            placeholder="Buscar"
                        />

                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m16 16 5 5" />
                        </svg>
                    </div>

                    <Link to="/carrinho" className="profileHeaderIcon" aria-label="Carrinho">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 3h2l2.5 12h11L21 7H5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="17" cy="19" r="1.5" />
                        </svg>
                    </Link>

                    <div className="profileUser">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
                        </svg>

                        <span><strong>Nome:</strong> Fulano</span>
                    </div>

                </div>

            </header>

            <main className="ProfileMain">

                <h1>Perfil</h1>

                <form onSubmit={handleSubmit}>

                    <section className="profileSection">

                        <h2>Informações pessoais:</h2>

                        <div className="profileGrid personalGrid">

                            <input
                                type="text"
                                name="nome"
                                placeholder="Nome"
                                value={formData.nome}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="sobrenome"
                                placeholder="Sobrenome"
                                value={formData.sobrenome}
                                onChange={handleChange}
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <input
                                type="tel"
                                name="telefone"
                                placeholder="Telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                            />

                        </div>

                    </section>

                    <section className="profileSection">

                        <h2 className="profileSubtitle">Endereço 1:</h2>

                        <div className="profileGrid addressGrid">

                            <input
                                type="text"
                                name="cidade1"
                                placeholder="Cidade"
                                value={formData.cidade1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="estado1"
                                placeholder="Estado"
                                value={formData.estado1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="pais1"
                                placeholder="País"
                                value={formData.pais1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="cep1"
                                placeholder="CEP"
                                value={formData.cep1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="complemento1"
                                placeholder="Complemento"
                                value={formData.complemento1}
                                onChange={handleChange}
                                className="profileWideInput"
                            />

                        </div>

                    </section>

                    <section className="profileSection">

                        <div className="profileAddressHeader">

                            <h2 className="profileSubtitle">Endereço 2:</h2>

                            <label className="profileCheckbox">
                                <input
                                    type="checkbox"
                                    checked={semSegundoEndereco}
                                    onChange={(e) => setSemSegundoEndereco(e.target.checked)}
                                />
                                <span>Não possui</span>
                            </label>

                        </div>

                        <div className={`profileGrid addressGrid ${semSegundoEndereco ? "addressDisabled" : ""}`}>

                            <input
                                type="text"
                                name="pais2"
                                placeholder="País"
                                value={formData.pais2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="estado2"
                                placeholder="Estado"
                                value={formData.estado2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="cidade2"
                                placeholder="Cidade"
                                value={formData.cidade2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="cep2"
                                placeholder="CEP"
                                value={formData.cep2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="complemento2"
                                placeholder="Complemento"
                                value={formData.complemento2}
                                onChange={handleChange}
                                className="profileWideInput"
                                disabled={semSegundoEndereco}
                            />

                        </div>

                    </section>

                    <section className="profileSection profilePreferences">

                        <h2>Preferências:</h2>

                        <div className="profilePreferencesContent">

                            <div className="profileSelectGroup">
                                <label htmlFor="idioma">Idioma</label>

                                <select
                                    id="idioma"
                                    name="idioma"
                                    value={formData.idioma}
                                    onChange={handleChange}
                                >
                                    <option value=""></option>
                                    <option value="Português">Português</option>
                                    <option value="Inglês">Inglês</option>
                                    <option value="Espanhol">Espanhol</option>
                                </select>
                            </div>

                            <div className="profileSelectGroup">
                                <label htmlFor="categoria">Categoria favorita</label>

                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                >
                                    <option value=""></option>
                                    <option value="Cachorro">Cachorro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Réptil">Réptil</option>
                                    <option value="Pássaro">Pássaro</option>
                                    <option value="Peixe">Peixe</option>
                                </select>
                            </div>

                            <label className="profileCheckbox preferenceCheckbox">
                                <input
                                    type="checkbox"
                                    checked={minhaLista}
                                    onChange={(e) => setMinhaLista(e.target.checked)}
                                />
                                <span>Ativar Minha Lista</span>
                            </label>

                            <label className="profileCheckbox preferenceCheckbox">
                                <input
                                    type="checkbox"
                                    checked={meuBanner}
                                    onChange={(e) => setMeuBanner(e.target.checked)}
                                />
                                <span>Ativar Meu Banner</span>
                            </label>

                        </div>

                    </section>

                    <button type="submit" className="profileSaveButton">
                        Salvar
                    </button>

                </form>

            </main>

        </div>
    );
}

export default ProfilePage;
