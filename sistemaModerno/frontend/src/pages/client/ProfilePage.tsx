import { t } from "../../services/idioma";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import "./ProfilePage.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { Link, useNavigate } from "react-router-dom";
import { obterPerfil, alterarPerfil, cadastrarEndereco, editarEndereco, removerEndereco, type Perfil, type DadosEndereco, type Idioma } from "../../services/usuarios";
import { mensagemDeErro, naoAutenticado, obterSessao, salvarSessao } from "../../services/api";
import { definirIdioma } from "../../services/idioma";
import ConfigurarRodape from "../../components/client/ConfigurarRodape";
import AlteracaoSenha from "../../components/client/AlteracaoSenha";
import UserBox from "../../components/client/UserBox";
import SearchBox from "../../components/client/SearchBox";
const idiomas: Record<string, Idioma> = { "Português": "pt-BR", "Inglês": "en", "Espanhol": "es" };
const categorias: Record<string,string> = { Cachorro: "dogs", Gato: "cats", "Réptil": "reptiles", "Pássaro": "birds", Peixe: "fish" };
function camposEndereco(e: Perfil["enderecos"][number] | undefined, numero: number) {
    return { ["cidade"+numero]: e?.cidade ?? "", ["estado"+numero]: e?.estado ?? "", ["pais"+numero]: e?.pais ?? "Brasil",
        ["cep"+numero]: e?.cep ?? "", ["complemento"+numero]: [e?.rua,e?.numero,e?.complemento].filter(Boolean).join(", ") };
}

function ProfilePage() {
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [aviso, setAviso] = useState("");

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

    const preencher = useCallback((p: Perfil) => {
        setPerfil(p);
        setSemSegundoEndereco(!p.enderecos[1]);
        setMinhaLista(p.preferencias.minhaLista === true);
        setMeuBanner(p.preferencias.meuBanner === true);
        setFormData(atual => ({...atual, nome:p.nome, sobrenome:p.sobrenome, email:p.email, telefone:p.telefone ?? "",
            ...camposEndereco(p.enderecos[0],1), ...camposEndereco(p.enderecos[1],2),
            idioma:Object.keys(idiomas).find(k=>idiomas[k]===p.idiomaPreferencial) ?? "Português",
            categoria:Object.keys(categorias).find(k=>categorias[k]===p.preferencias.categoriaFavorita) ?? "" }));
    }, []);
    useEffect(() => {
        let ativo=true;
        obterPerfil().then(p=>{if(ativo)preencher(p);}).catch(e=>{
            if(ativo){if(naoAutenticado(e))navigate("/login");else setAviso(mensagemDeErro(e));}
        }).finally(()=>{if(ativo)setCarregando(false);});
        return ()=>{ativo=false;};
    },[navigate,preencher]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(!perfil||salvando)return;
        const dadosEndereco = (n: 1|2): DadosEndereco => {
            const [rua,numero,...complemento]=formData[("complemento"+n) as "complemento1"|"complemento2"].split(",").map(v=>v.trim());
            if(!rua||!numero)throw new Error("Preencha o endereço "+n+" como Rua, número, complemento.");
            const sufixo=String(n);
            return {rua,numero,complemento:complemento.join(", "),bairro:perfil.enderecos[n-1]?.bairro ?? "",
                cidade:formData[("cidade"+sufixo) as "cidade1"|"cidade2"],estado:formData[("estado"+sufixo) as "estado1"|"estado2"],
                pais:formData[("pais"+sufixo) as "pais1"|"pais2"],cep:formData[("cep"+sufixo) as "cep1"|"cep2"]};
        };
        try {
            const mudouEndereco = (indice: number) =>
                Object.entries(camposEndereco(perfil.enderecos[indice - 1], indice))
                    .some(([campo, valor]) => formData[campo as keyof typeof formData] !== valor);
            const primeiro = mudouEndereco(1) ? dadosEndereco(1) : null;
            const segundo = !semSegundoEndereco && (!perfil.enderecos[1] || mudouEndereco(2)) ? dadosEndereco(2) : null;
            setSalvando(true);setAviso("");
            if (primeiro) {
                if (perfil.enderecos[0]) await editarEndereco(perfil.enderecos[0].id, primeiro);
                else await cadastrarEndereco(primeiro);
            }
            if(segundo){if(perfil.enderecos[1])await editarEndereco(perfil.enderecos[1].id,segundo);else await cadastrarEndereco(segundo);}
            else if(semSegundoEndereco && perfil.enderecos[1])await removerEndereco(perfil.enderecos[1].id);
            const atualizado=await alterarPerfil({nome:formData.nome,sobrenome:formData.sobrenome,email:formData.email,telefone:formData.telefone,
                idiomaPreferencial:idiomas[formData.idioma],preferencias:{...perfil.preferencias,minhaLista,meuBanner,categoriaFavorita:categorias[formData.categoria] ?? ""}});
            definirIdioma(atualizado.idiomaPreferencial);
            preencher(atualizado);
            const sessao=obterSessao();if(sessao)salvarSessao({...sessao,usuario:{...sessao.usuario,nome:atualizado.nome,email:atualizado.email}});
            setAviso("Informações salvas com sucesso.");
        }catch(falha){
            if(naoAutenticado(falha))navigate("/login");else setAviso(falha instanceof Error && !('isAxiosError' in falha)?falha.message:mensagemDeErro(falha));
        }finally{setSalvando(false);}
    }

    return (
        <div className="container detailsPaymentPage profilePage">

            <header className="headerClient profileHeader">

                <Link to="/HomeClient" className="logoLink">
                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />
                </Link>

                <div className="profileHeaderActions">

                    <SearchBox />

                    <Link to="/Cart" className="profileHeaderIcon" aria-label={t("Carrinho")}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2 3h2l2.5 12h11L21 7H5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="17" cy="19" r="1.5" />
                        </svg>
                    </Link>

                    <UserBox />

                </div>

            </header>

            <main className="ProfileMain">

                <h1>{t("Perfil")}</h1>

                {aviso && <p role="status">{t(aviso)}</p>}
                {carregando && <p role="status">{t("Carregando perfil...")}</p>}
                <form onSubmit={handleSubmit}><fieldset disabled={carregando || salvando || !perfil} style={{border:0,padding:0,margin:0,minWidth:0}}>

                    <section className="profileSection">

                        <h2>{t("Informações pessoais:")}</h2>

                        <div className="profileGrid personalGrid">

                            <input
                                type="text"
                                name="nome"
                                placeholder={t("Nome")} required
                                value={formData.nome}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="sobrenome"
                                placeholder={t("Sobrenome")} required
                                value={formData.sobrenome}
                                onChange={handleChange}
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder={t("Email")} required
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <input
                                type="tel"
                                name="telefone"
                                placeholder={t("Telefone")}
                                value={formData.telefone}
                                onChange={handleChange}
                            />

                        </div>

                    </section>

                    <section className="profileSection">

                        <h2 className="profileSubtitle">{t("Endereço 1:")}</h2>

                        <div className="profileGrid addressGrid">

                            <input
                                type="text"
                                name="cidade1"
                                placeholder={t("Cidade")}
                                value={formData.cidade1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="estado1"
                                placeholder={t("Estado")}
                                value={formData.estado1}
                                onChange={handleChange}
                            />

                            <input
                                type="text"
                                name="pais1"
                                placeholder={t("País")}
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
                                placeholder={t("Rua, número, complemento")}
                                value={formData.complemento1}
                                onChange={handleChange}
                                className="profileWideInput"
                            />

                        </div>

                    </section>

                    <section className="profileSection">

                        <div className="profileAddressHeader">

                            <h2 className="profileSubtitle">{t("Endereço 2:")}</h2>

                            <label className="profileCheckbox">
                                <input
                                    type="checkbox"
                                    checked={semSegundoEndereco}
                                    onChange={(e) => setSemSegundoEndereco(e.target.checked)}
                                />
                                <span>{t("Não possui")}</span>
                            </label>

                        </div>

                        <div className={`profileGrid addressGrid ${semSegundoEndereco ? "addressDisabled" : ""}`}>

                            <input
                                type="text"
                                name="pais2"
                                placeholder={t("País")}
                                value={formData.pais2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="estado2"
                                placeholder={t("Estado")}
                                value={formData.estado2}
                                onChange={handleChange}
                                disabled={semSegundoEndereco}
                            />

                            <input
                                type="text"
                                name="cidade2"
                                placeholder={t("Cidade")}
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
                                placeholder={t("Rua, número, complemento")}
                                value={formData.complemento2}
                                onChange={handleChange}
                                className="profileWideInput"
                                disabled={semSegundoEndereco}
                            />

                        </div>

                    </section>

                    <section className="profileSection profilePreferences">

                        <h2>{t("Preferências:")}</h2>

                        <div className="profilePreferencesContent">

                            <div className="profileSelectGroup">
                                <label htmlFor="idioma">{t("Idioma")}</label>

                                <select
                                    id="idioma"
                                    name="idioma"
                                    value={formData.idioma}
                                    onChange={handleChange}
                                >
                                    <option value=""></option>
                                    <option value="Português">{t("Português")}</option>
                                    <option value="Inglês">{t("Inglês")}</option>
                                    <option value="Espanhol">{t("Espanhol")}</option>
                                </select>
                            </div>

                            <div className="profileSelectGroup">
                                <label htmlFor="categoria">{t("Categoria favorita")}</label>

                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                >
                                    <option value=""></option>
                                    <option value="Cachorro">{t("Cachorro")}</option>
                                    <option value="Gato">{t("Gato")}</option>
                                    <option value="Réptil">{t("Réptil")}</option>
                                    <option value="Pássaro">{t("Pássaro")}</option>
                                    <option value="Peixe">{t("Peixe")}</option>
                                </select>
                            </div>

                            <label className="profileCheckbox preferenceCheckbox">
                                <input
                                    type="checkbox"
                                    checked={minhaLista}
                                    onChange={(e) => setMinhaLista(e.target.checked)}
                                />
                                <span>{t("Ativar Minha Lista")}</span>
                            </label>

                            <label className="profileCheckbox preferenceCheckbox">
                                <input
                                    type="checkbox"
                                    checked={meuBanner}
                                    onChange={(e) => setMeuBanner(e.target.checked)}
                                />
                                <span>{t("Ativar Meu Banner")}<br /><small>{t("Esta opção usa sua categoria favorita.")}</small></span>
                            </label>

                        </div>

                    </section>

                    <button type="submit" className="profileSaveButton">
                        {t("Salvar")}
                    </button>

                </fieldset></form>

                {perfil && <><AlteracaoSenha /><ConfigurarRodape /></>}
            </main>

        </div>
    );
}

export default ProfilePage;
