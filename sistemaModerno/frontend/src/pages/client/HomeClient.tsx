import { t } from "../../services/idioma";

import { useEffect, useState } from "react";
import type {
    ChangeEvent,
    FormEvent
} from "react";

import "./HomeClient.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import pata from "../../assets/imagens/pata.png";
import iconemenufavorito from "../../assets/imagens/iconemenufavorito.png";
import slideCachorro from "../../assets/imagens/animais/slidesClientHome/slideCachorroHomeClient.png";
import slideGato from "../../assets/imagens/animais/slidesClientHome/slideGatoHomeClient.png";
import slideReptil from "../../assets/imagens/animais/slidesClientHome/slideReptilHomeClient.png";
import slidePassaro from "../../assets/imagens/animais/slidesClientHome/slidePassaroHomeClient.png";
import slidePeixe from "../../assets/imagens/animais/slidesClientHome/slidePeixeHomeClient.png";

import { Link } from "react-router-dom";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import ModalLaudos from "../../components/ModalLaudos";
import { buscarAnimais, paraCardPet } from "../../services/animais";
import type { CardPet, Especie } from "../../services/animais";
import { obterPerfil, type Perfil } from "../../services/usuarios";
import { obterRodape, type Rodape } from "../../services/rodape";
import { excluirFavorito, incluirFavorito, listarFavoritos, type Favorito } from "../../services/favoritos";
import { mensagemDeErro, obterSessao } from "../../services/api";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";
import { useRacasDoCatalogo } from "../../hooks/useRacasDoCatalogo";

const ROTULO_DA_RACA = {
    Cachorro: "Raça",
    Gato: "Raça",
    Réptil: "Espécie",
    Pássaro: "Espécie",
    Peixe: "Espécie"
};

type TipoAnimal = keyof typeof ROTULO_DA_RACA;

type Pet = CardPet;

const TIPOS: Record<TipoAnimal, Especie> = {
    Cachorro: "CACHORRO", Gato: "GATO", "Réptil": "REPTIL", "Pássaro": "PASSARO", Peixe: "PEIXE",
};

const CATEGORIAS = [
    { preferencia: "dogs", tipo: "Cachorro", imagem: slideCachorro },
    { preferencia: "cats", tipo: "Gato", imagem: slideGato },
    { preferencia: "reptiles", tipo: "Reptil", imagem: slideReptil },
    { preferencia: "birds", tipo: "Passaro", imagem: slidePassaro },
    { preferencia: "fish", tipo: "Peixe", imagem: slidePeixe },
];


function HomeClient() {

    const [modalLaudo, setModalLaudo] = useState<boolean>(false);
    const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);

    const [menuAberto, setMenuAberto] = useState<boolean>(false);

    const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal | "">("");
    const [racaEspecie, setRacaEspecie] = useState<string>("");
    const racas = useRacasDoCatalogo(tipoAnimal || null);

    const [favoritos, setFavoritos] = useState<Favorito[]>([]);
    const [erroFavoritos, setErroFavoritos] = useState("");
    const [salvandoFavorito, setSalvandoFavorito] = useState(false);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [rodape, setRodape] = useState<Rodape | null>(null);
    const usuarioId = obterSessao()?.usuario.id;
    const categoriaFavorita = CATEGORIAS.find(categoria => categoria.preferencia === perfil?.preferencias.categoriaFavorita);
    const minhaLista = perfil?.id === usuarioId && perfil?.preferencias.minhaLista === true;
    const banner = perfil?.id === usuarioId && perfil?.preferencias.meuBanner === true
        ? categoriaFavorita
        : undefined;

    const [pets, setPets] = useState<Pet[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erroBusca, setErroBusca] = useState<string>("");

    useEffect(() => {
        if (!usuarioId) return;
        let ativo = true;
        obterPerfil().then(dados => { if (ativo) setPerfil(dados); }).catch(() => {});
        obterRodape().then(dados => { if (ativo) setRodape(dados); }).catch(() => {});
        listarFavoritos().then(lista => { if (ativo) setFavoritos(lista); })
            .catch(falha => { if (ativo) setErroFavoritos(mensagemDeErro(falha)); });
        return () => { ativo = false; };
    }, [usuarioId]);

    // RF07 — "Conheça eles": primeiros animais disponíveis
    useEffect(() => {
        buscarAnimais({ size: 6 })
            .then((pagina) => setPets(pagina.conteudo.map(paraCardPet)))
            .catch((erro) => setErroBusca(mensagemDeErro(erro)))
            .finally(() => setCarregando(false));
    }, []);

    // RF09 — Adicionar ao carrinho (exige login)
    const adicionarCarrinho = useAdicionarAoCarrinho();

    

    function abrirLaudo(pet: Pet): void {
        setPetSelecionado(pet);
        setModalLaudo(true);
    }

    function fecharLaudo(): void {
        setModalLaudo(false);
        setPetSelecionado(null);
    }


    function abrirMenu(): void {
        setMenuAberto(true);
    }

    function fecharMenu(): void {
        setMenuAberto(false);
    }


    function alterarTipoAnimal(
        event: ChangeEvent<HTMLSelectElement>
    ): void {

        setTipoAnimal(event.target.value as TipoAnimal | "");

        setRacaEspecie("");
    }

    async function salvarFavorito(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (!tipoAnimal || !racaEspecie || salvandoFavorito) return;

        const especie = TIPOS[tipoAnimal];
        if (favoritos.some(favorito => favorito.especie === especie && favorito.raca === racaEspecie)) {
            setErroFavoritos("Esse animal já está nos seus favoritos!");
            return;
        }
        setSalvandoFavorito(true);
        setErroFavoritos("");
        try {
            await incluirFavorito(especie, racaEspecie);
            setFavoritos(await listarFavoritos());
            setTipoAnimal("");
            setRacaEspecie("");
        } catch (falha) {
            setErroFavoritos(mensagemDeErro(falha));
        } finally {
            setSalvandoFavorito(false);
        }
    }

    async function removerFavorito(id: string) {
        setSalvandoFavorito(true);
        setErroFavoritos("");
        try {
            await excluirFavorito(id);
            setFavoritos(lista => lista.filter(favorito => favorito.id !== id));
        } catch (falha) {
            setErroFavoritos(mensagemDeErro(falha));
        } finally {
            setSalvandoFavorito(false);
        }
    }

    return (

        <div className="container">

            <header className="headerClient">

                <img
                    src={logo}
                    alt="Logo JPetStore"
                    className="logo"
                />

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


            <main>

                <section className="presentationHomeClient">

                    <div className="presentationTitle">

                        <img
                            src={pata}
                            alt={t("Pata")}
                            className="paw pawLeft"
                        />

                        <h1>{t("SEU MELHOR AMIGO ESTA AQUI!")}</h1>

                        <img
                            src={pata}
                            alt={t("Pata")}
                            className="paw pawRight"
                        />

                    </div>

                    <div className="presentationImage">
                        {(banner ? [banner] : CATEGORIAS).map(categoria => (
                            <Link key={categoria.tipo} to={`/Products?tipo=${categoria.tipo}`}>
                                <img src={categoria.imagem} alt={t(categoria.tipo)} />
                            </Link>
                        ))}
                    </div>

                </section>


                <section className="filterConteiner">

                    <h2>{t("Conheça eles")}</h2>

                    {carregando && <p>{t("Carregando animais...")}</p>}
                    {erroBusca && <p role="alert">{t(erroBusca)}</p>}
                    {!carregando && !erroBusca && pets.length === 0 && (
                        <p>{t("Nenhum animal disponível no momento.")}</p>
                    )}

                    <div className="petsGrid">

                        {pets.map((pet) => (

                            <article className="petCard" key={pet.id}>

                                <Link to={`/SpecificProduct?id=${pet.id}`} className="petImage">

                                    <img
                                        src={pet.imagem}
                                        alt={pet.nome}
                                    />

                                </Link>

                                <div className="petInformation">

                                    <div className="petTitle">

                                        <h3>{pet.nome}</h3>

                                    </div>

                                    <div className="petDetails">

                                        <p>
                                            <strong>{t("Raça:")}</strong> {pet.raca}
                                        </p>

                                        <p>
                                            <strong>{t("Ficha:")}</strong>
                                        </p>

                                        <p>
                                            <strong>{t("Nascimento:")}</strong> {pet.nascimento}
                                        </p>

                                        <p>
                                            <strong>{t("Criador:")}</strong>{" " + t("Nome")}
                                        </p>

                                        <p>
                                            <strong>{t("Proprietário:")}</strong>{" " + t("Nome")}
                                        </p>

                                    </div>

                                    <div className="petTags">

                                        <span className="tagTitle">
                                            {t("TAGs:")}
                                        </span>

                                        <div className="tags">

                                            {pet.tags.map((tag, index) => (
                                                <span
                                                    className="tag"
                                                    key={index}
                                                    title={tag}
                                                />
                                            ))}

                                        </div>

                                        <div className="tags tagsSecondary">
                                            <span />
                                            <span />
                                            <span />
                                        </div>

                                    </div>

                                    <div className="petActions">

                                        <button
                                            type="button"
                                            className="petLaudos"
                                            onClick={() => abrirLaudo(pet)}
                                        >
                                            {t("Laudos")}
                                        </button>

                                        <button
                                            type="button"
                                            className="btnAddCart"
                                            onClick={() => adicionarCarrinho(pet)}
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

                                            {t("Adicionar ao carrinho")}

                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </div>

                </section>

            </main>

            {modalLaudo && petSelecionado && (

                <ModalLaudos
                    animalId={petSelecionado.id}
                    nome={petSelecionado.nome}
                    onFechar={fecharLaudo}
                />

            )}

            {minhaLista && <>
            <button
                type="button"
                className="btnMenuFavoritos"
                onClick={abrirMenu}
                aria-label={t("Abrir menu de animais favoritos")}
            >

                <img
                    src={iconemenufavorito}
                    alt={t("Ícone de menu de favoritos")}
                />

            </button>


            {menuAberto && (

                <div
                    className="menuOverlay"
                    onClick={fecharMenu}
                />

            )}


            <aside
                className={`menuFavoritos ${menuAberto ? "menuAberto" : ""}`}
                inert={!menuAberto}
                aria-hidden={!menuAberto}
            >


                <div className="menuFavoritosHeader">

                    <div>

                        <h3>{t("Pet Favorito")}</h3>

                        <p>
                            {t("Encontre aqui mais dos seus pets favoritos.")}
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={fecharMenu}
                        aria-label={t("Fechar menu")}
                    >
                        ×
                    </button>

                </div>

                <div className="menuFavoritosConteudo">
                    {erroFavoritos && <p role="alert">{t(erroFavoritos)}</p>}


                    <div
                        className={`listaFavoritos ${
                            favoritos.length > 3
                                ? "listaFavoritosScroll"
                                : ""
                        }`}
                    >

                        {favoritos.length === 0 ? (
                            <p className="semFavoritos">{t("Você ainda não possui animais favoritos.")}</p>
                        ) : favoritos.map(favorito => {
                            const tipo = (Object.keys(TIPOS) as TipoAnimal[]).find(valor => TIPOS[valor] === favorito.especie);
                            const rotaTipo = (tipo ?? favorito.especie).normalize("NFD").replace(/\p{Diacritic}/gu, "");
                            const params = new URLSearchParams({ tipo: rotaTipo, raca: favorito.raca });
                            return (
                                <div className="favoritoItem" key={favorito.id}>
                                    <div className="favoritoInfo">
                                        <strong>{t(tipo ?? favorito.especie)}</strong>
                                        <Link to={"/Products?" + params} onClick={fecharMenu}>{favorito.raca}</Link>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={salvandoFavorito}
                                        onClick={() => removerFavorito(favorito.id)}
                                        aria-label={t("Remover {raca}", { raca: favorito.raca })}
                                    >×</button>
                                </div>
                            );
                        })}
                    </div>

                    <form
                        className="formFavoritos"
                        onSubmit={salvarFavorito}
                    >


                        <div className="campoFavorito">

                            <label htmlFor="tipoAnimal">
                                {t("Tipo")}
                            </label>

                            <select
                                id="tipoAnimal"
                                value={tipoAnimal}
                                onChange={alterarTipoAnimal}
                                required
                            >

                                <option value="">
                                    {t("Selecione")}
                                </option>

                                <option value="Cachorro">
                                    {t("Cachorro")}
                                </option>

                                <option value="Gato">
                                    {t("Gato")}
                                </option>

                                <option value="Réptil">
                                    {t("Réptil")}
                                </option>

                                <option value="Pássaro">
                                    {t("Pássaro")}
                                </option>

                                <option value="Peixe">
                                    {t("Peixe")}
                                </option>

                            </select>

                        </div>

                        {tipoAnimal && (

                            <div className="campoFavorito">

                                <label htmlFor="racaEspecie">
                                    {ROTULO_DA_RACA[tipoAnimal]}
                                </label>

                                <select
                                    id="racaEspecie"
                                    value={racaEspecie}
                                    onChange={(
                                        event: ChangeEvent<HTMLSelectElement>
                                    ) => setRacaEspecie(event.target.value)}
                                    required
                                >

                                    <option value="">
                                        {t("Selecione")}
                                    </option>

                                    {racas.map(
                                        (opcao) => (

                                            <option
                                                value={opcao}
                                                key={opcao}
                                            >
                                                {t(opcao)}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        )}


                        <button
                            type="submit"
                            className="btnSalvarFavorito"
                            disabled={salvandoFavorito || !racaEspecie}
                        >
                            {t("Salvar")}
                        </button>

                    </form>

                </div>

            </aside>
            </>}

            {rodape?.visivel !== false && <footer>
                    <div className="footerInfo">
                        <img
                            src={logo}
                            alt="Logo JPetStore"
                            className="logo"
                        />
                        {rodape?.conteudoHtml ? <iframe
                            className="rodapePersonalizado"
                            title={t("Conteúdo do rodapé")}
                            sandbox=""
                            referrerPolicy="no-referrer"
                            srcDoc={`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>body{margin:0;font:16px system-ui;overflow-wrap:anywhere;color:#fff}</style>${rodape.conteudoHtml}`}
                        /> : <p>{t("Encontre seu companheiro ideal e descubra o amor que só um pet pode oferecer.")}</p>}
                        <Link to="/cadastroUser" className="btnCadastro">
                            {t("Cadastre-se")}
                        </Link>
                    </div>

                    <nav className="footerLinks" aria-label={t("Rodapé")}>
                        <Link to="/HomeClient">{t("Inicio")}</Link>
                        {CATEGORIAS.map(categoria => (
                            <Link key={categoria.tipo} to={"/Products?tipo=" + categoria.tipo}>{t(categoria.tipo)}</Link>
                        ))}
                        <Link to="/HelpPage">{t("Como podemos ajudar?")}</Link>
                    </nav>
            </footer>}

        </div>

        

    );
}

export default HomeClient;
