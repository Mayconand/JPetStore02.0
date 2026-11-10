
import "./CadastroUser.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import imagemLogin from "../../assets/imagens/imagemLogin.png";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { buscarCEP } from "../../services/cep";
import { cadastrar } from "../../services/usuarios";
import type { EnderecoEntrada, Idioma } from "../../services/usuarios";
import { login } from "../../services/auth";
import { mensagemDeErro } from "../../services/api";

function CadastroUser() {
    type Endereco = {
        city: string;
        state: string;
        country: string;
        zipCode: string;
        complement: string;
        // Preenchidos pela consulta de CEP (ainda não há campos na tela para eles).
        street?: string;
        district?: string;
    };

    const navigate = useNavigate();
    const [semSegundoEndereco, setSemSegundoEndereco] = useState(false);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    const [endereco1, setEndereco1] = useState<Endereco>({
        city: "",
        state: "",
        country: "Brasil",
        zipCode: "",
        complement: ""
    });

    const [endereco2, setEndereco2] = useState<Endereco>({
        city: "",
        state: "",
        country: "Brasil",
        zipCode: "",
        complement: ""
    });

    function paraEnderecoApi(endereco: Endereco, complemento: FormDataEntryValue | null): EnderecoEntrada {
        return {
            rua: endereco.street,
            bairro: endereco.district,
            complemento: String(complemento ?? "").trim() || undefined,
            cidade: endereco.city.trim(),
            estado: endereco.state.trim(),
            cep: endereco.zipCode.trim(),
            pais: endereco.country.trim() || "Brasil"
        };
    }

    // RF03 — Realizar Cadastro (o endereço 1 vira o endereço principal)
    async function salvar(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const dados = new FormData(event.currentTarget);
        const senha = String(dados.get("password"));

        if (senha !== String(dados.get("confirmPassword"))) {
            setErro("As senhas não conferem.");
            return;
        }

        const enderecos = [paraEnderecoApi(endereco1, dados.get("complement"))];
        if (!semSegundoEndereco && endereco2.zipCode.trim()) {
            enderecos.push(paraEnderecoApi(endereco2, dados.get("complement2")));
        }

        const email = String(dados.get("email")).trim();
        setErro("");
        setEnviando(true);
        try {
            await cadastrar({
                nome: String(dados.get("name")).trim(),
                sobrenome: String(dados.get("lastName")).trim(),
                email,
                telefone: String(dados.get("phone")).trim(),
                senha,
                idiomaPreferencial: (String(dados.get("language")) || undefined) as Idioma | undefined,
                preferencias: {
                    categoriaFavorita: String(dados.get("category")) || null,
                    ativarMinhaLista: dados.get("activateList") === "on",
                    ativarMeuBanner: dados.get("activateBanner") === "on"
                },
                enderecos
            });
            await login(email, senha);
            navigate("/HomeClient");
        } catch (e) {
            setErro(mensagemDeErro(e));
        } finally {
            setEnviando(false);
        }
    }

    // Consulta o CEP e preenche o endereço correspondente
    const preencherCEP = async (cep: string, endereco: 1 | 2) => {
        if (!cep.trim()) return;

        try {
            const dados = await buscarCEP(cep);

            const atualizar = endereco === 1 ? setEndereco1 : setEndereco2;

            atualizar((anterior) => ({
                ...anterior,
                city: dados.localidade,
                state: dados.uf,
                country: "Brasil",
                street: dados.logradouro || undefined,
                district: dados.bairro || undefined
            }));

        } catch (erro) {
            alert(erro instanceof Error ? erro.message : "Erro ao consultar CEP.");
        }
    };







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

                    <form onSubmit={salvar}>

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

                            <input
                                type="password"
                                name="password"
                                placeholder="Senha (mínimo 8 caracteres)"
                                aria-label="Senha"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmar senha"
                                aria-label="Confirmar senha"
                                autoComplete="new-password"
                                minLength={8}
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
                                value={endereco1.city}
                                onChange={(e) => setEndereco1({
                                    ...endereco1,
                                    city: e.target.value
                                })}
                                required
                            />

                            <input
                                type="text"
                                name="state"
                                placeholder="Estado"
                                value={endereco1.state}
                                onChange={(e) => setEndereco1({
                                    ...endereco1,
                                    state: e.target.value
                                })}
                                required
                            />

                            <input
                                type="text"
                                name="country"
                                placeholder="País"
                                value={endereco1.country}
                                onChange={(e) => setEndereco1({
                                    ...endereco1,
                                    country: e.target.value
                                })}
                                required
                            />

                            <input
                                type="text"
                                name="zipCode"
                                placeholder="CEP"
                                value={endereco1.zipCode}
                                onChange={(e) => setEndereco1({
                                    ...endereco1,
                                    zipCode: e.target.value
                                })}
                                onBlur={() => preencherCEP(endereco1.zipCode, 1)}
                                maxLength={9}
                                inputMode="numeric"
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
                                    checked={semSegundoEndereco}
                                    onChange={(e) => setSemSegundoEndereco(e.target.checked)}
                                />
                                Não possui
                            </label>
                        </div>

                        <div className="formGrid gridThree">
                            <input
                                type="text"
                                name="city2"
                                placeholder="Cidade"
                                value={endereco2.city}
                                onChange={(e) => setEndereco2({
                                    ...endereco2,
                                    city: e.target.value
                                })}
                                required={!semSegundoEndereco}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="state2"
                                placeholder="Estado"
                                value={endereco2.state}
                                onChange={(e) => setEndereco2({
                                    ...endereco2,
                                    state: e.target.value
                                })}
                                required={!semSegundoEndereco}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="country2"
                                placeholder="País"
                                value={endereco2.country}
                                onChange={(e) => setEndereco2({
                                    ...endereco2,
                                    country: e.target.value
                                })}
                                required={!semSegundoEndereco}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="zipCode2"
                                placeholder="CEP"
                                value={endereco2.zipCode}
                                onChange={(e) => setEndereco2({
                                    ...endereco2,
                                    zipCode: e.target.value
                                })}
                                onBlur={() => preencherCEP(endereco2.zipCode, 2)}
                                required={!semSegundoEndereco}
                                disabled={semSegundoEndereco}
                                maxLength={9}
                                inputMode="numeric"
                            />

                            <input
                                type="text"
                                name="complement2"
                                placeholder="Complemento"
                                aria-label="Segundo endereço: complemento"
                                disabled={semSegundoEndereco}
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

                        {erro && (
                            <p className="formErro" role="alert">{erro}</p>
                        )}

                        <button type="submit" disabled={enviando}>
                            {enviando ? "Salvando..." : "Salvar"}
                        </button>

                    </form>

                </div>

            </section>

        </div>
    );
}

export default CadastroUser;
