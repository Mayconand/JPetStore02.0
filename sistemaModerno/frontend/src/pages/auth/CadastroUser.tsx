
import "./CadastroUser.css";
import logo from "../../assets/imagens/logoJPetStore.png";
import imagemLogin from "../../assets/imagens/imagemLogin.png";

function CadastroUser() {
    return (
        <div className="cadastroContainer">

            {/* Imagem lateral */}
            <section className="cadastroImage">

                <img
                    src={imagemLogin}
                    alt="Cachorro em um ambiente externo"
                />

                <div className="cadastroMessage">
                    <h2>
                        Primeiro passo para encontrar seu novo companheiro
                    </h2>
                </div>

            </section>

            {/* Formulário de cadastro */}
            <section className="cadastro">

                <img
                    src={logo}
                    alt="Logo JPetStore"
                    className="cadastroLogo"
                />

                <div className="cadastroForm">

                    <h1>Bem-vindo!</h1>

                    <h3 className="cadastroDescription">
                        Crie sua conta e dê o primeiro passo para encontrar
                        seu novo companheiro de quatro patas.
                    </h3>

                    <form>

                        {/* Informações pessoais */}
                        <p className="formSectionTitle">
                            Informações pessoais:
                        </p>

                        <div className="formGrid gridTwo">
                            <input
                                type="text"
                                name="name"
                                placeholder="Nome"
                                aria-label="Nome"
                                required
                            />

                            <input
                                type="text"
                                name="lastName"
                                placeholder="Sobrenome"
                                aria-label="Sobrenome"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                aria-label="Email"
                                required
                            />

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Telefone"
                                aria-label="Telefone"
                                required
                            />
                        </div>

                        {/* Endereço 1 */}
                        <p className="formSectionTitle">
                            Endereço 1:
                        </p>

                        <div className="formGrid gridThree">
                            <input
                                type="text"
                                name="city"
                                placeholder="Cidade"
                                aria-label="Cidade"
                                required
                            />

                            <input
                                type="text"
                                name="state"
                                placeholder="Estado"
                                aria-label="Estado"
                                required
                            />

                            <input
                                type="text"
                                name="country"
                                placeholder="País"
                                aria-label="País"
                                required
                            />

                            <input
                                type="text"
                                name="zipCode"
                                placeholder="CEP"
                                aria-label="CEP"
                                required
                            />

                            <input
                                type="text"
                                name="complement"
                                placeholder="Complemento"
                                aria-label="Complemento"
                                className="spanTwo"
                            />
                        </div>

                        {/* Endereço 2 */}
                        <div className="addressHeader">
                            <p className="formSectionTitle">
                                Endereço 2:
                            </p>

                            <label className="checkboxLabel">
                                <input
                                    type="checkbox"
                                    name="noSecondAddress"
                                />
                                Não possui
                            </label>
                        </div>

                        <div className="formGrid gridThree">
                            <input
                                type="text"
                                name="country2"
                                placeholder="País"
                                aria-label="Segundo endereço: país"
                            />

                            <input
                                type="text"
                                name="state2"
                                placeholder="Estado"
                                aria-label="Segundo endereço: estado"
                            />

                            <input
                                type="text"
                                name="city2"
                                placeholder="Cidade"
                                aria-label="Segundo endereço: cidade"
                            />

                            <input
                                type="text"
                                name="zipCode2"
                                placeholder="CEP"
                                aria-label="Segundo endereço: CEP"
                            />

                            <input
                                type="text"
                                name="complement2"
                                placeholder="Complemento"
                                aria-label="Segundo endereço: complemento"
                                className="spanTwo"
                            />
                        </div>

                        {/* Preferências */}
                        <p className="formSectionTitle preferencesTitle">
                            Preferências:
                        </p>

                        <div className="preferencesGrid">

                            <div className="preferenceField">
                                <label htmlFor="language">Idioma</label>

                                <select id="language" name="language">
                                    <option value=""></option>
                                    <option value="pt-BR">Português</option>
                                    <option value="en">Inglês</option>
                                    <option value="es">Espanhol</option>
                                </select>
                            </div>

                            <div className="preferenceField">
                                <label htmlFor="category">
                                    Categoria favorita
                                </label>

                                <select id="category" name="category">
                                    <option value=""></option>
                                    <option value="dogs">Cachorros</option>
                                    <option value="cats">Gatos</option>
                                    <option value="birds">Repteis</option>
                                    <option value="birds">Aves</option>
                                    <option value="others">Peixes</option>
                                </select>
                            </div>

                            <label className="checkboxLabel preferenceCheck">
                                <input
                                    type="checkbox"
                                    name="activateList"
                                />
                                Ativar Minha Lista
                            </label>

                            <label className="checkboxLabel preferenceCheck">
                                <input
                                    type="checkbox"
                                    name="activateBanner"
                                />
                                Ativar Meu Banner
                            </label>

                        </div>

                        <button type="submit">
                            Salvar
                        </button>

                    </form>

                </div>

            </section>

        </div>
    );
}

export default CadastroUser;
