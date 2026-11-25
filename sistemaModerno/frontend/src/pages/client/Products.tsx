import { t, idiomaAtual } from "../../services/idioma";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Products.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import tituloCachorro from "../../assets/imagens/animais/titulos/tituloPagCachorro.png";
import tituloGato from "../../assets/imagens/animais/titulos/tituloPagGato.png";
import tituloReptil from "../../assets/imagens/animais/titulos/tituloPagReptil.png";
import tituloPassaro from "../../assets/imagens/animais/titulos/tituloPagPassaro.png";
import tituloPeixe from "../../assets/imagens/animais/titulos/tituloPagPeixe.png";
import { Link } from "react-router-dom";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import ModalLaudos from "../../components/ModalLaudos";
import { buscarAnimais, paraCardPet } from "../../services/animais";
import type { CardPet } from "../../services/animais";
import { mensagemDeErro } from "../../services/api";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";
import { useRacasDoCatalogo } from "../../hooks/useRacasDoCatalogo";


type Pet = CardPet;

/** Animais por página na lista. */
const TAMANHO_PAGINA = 12;

/** Faixas do filtro de preço da tela -> parâmetros da API. */
const FAIXAS_PRECO: Record<string, { precoMin?: number; precoMax?: number }> = {
    "0-100": { precoMax: 100 },
    "100-300": { precoMin: 100, precoMax: 300 },
    "300-500": { precoMin: 300, precoMax: 500 },
    "500-1000": { precoMin: 500, precoMax: 1000 },
    "1000+": { precoMin: 1000 }
};

/** A chave recomeça os filtros ao trocar de espécie: sem ela, a raça anterior continuaria filtrando escondida. */
function Products() {
    const [parametros] = useSearchParams();
    return <Catalogo key={JSON.stringify([parametros.get("tipo"), parametros.get("raca")])} />;
}

function Catalogo() {

    const [modalLaudo, setModalLaudo] = useState<boolean>(false);
    const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);

    function abrirLaudo(pet: Pet): void {
        setPetSelecionado(pet);
        setModalLaudo(true);
    }

    function fecharLaudo(): void {
        setModalLaudo(false);
        setPetSelecionado(null);
    }

    const [searchParams] = useSearchParams();

    const tipoAnimal = searchParams.get("tipo");
    const termo = searchParams.get("termo") ?? "";

    let imagemTitulo;

    if (tipoAnimal === "Cachorro") {
        imagemTitulo = tituloCachorro;

    } else if (tipoAnimal === "Gato") {
        imagemTitulo = tituloGato;

    } else if (tipoAnimal === "Reptil") {
        imagemTitulo = tituloReptil;

    } else if (tipoAnimal === "Passaro") {
        imagemTitulo = tituloPassaro;

    } else if (tipoAnimal === "Peixe") {
        imagemTitulo = tituloPeixe;
    }

    // As raças vêm do banco, então as cadastradas pelo administrador aparecem no filtro.
    const rotuloDaRaca = tipoAnimal === "Cachorro" || tipoAnimal === "Gato" ? "Raça" : "Espécie";
    const racas = useRacasDoCatalogo(tipoAnimal);

    const [racaEspecie, setRacaEspecie] = useState(searchParams.get("raca") ?? "");
    const [idade, setIdade] = useState("");
    const [preco, setPreco] = useState("");


    // RF07 — Buscar Animais com os filtros da tela, paginado.
    // A página volta para a primeira sempre que um filtro muda.
    const chaveFiltros = JSON.stringify([termo, tipoAnimal, racaEspecie, preco, idade]);
    const [paginacao, setPaginacao] = useState({ filtros: chaveFiltros, pagina: 0 });
    const pagina = paginacao.filtros === chaveFiltros ? paginacao.pagina : 0;

    function irParaPagina(numero: number): void {
        setPaginacao({ filtros: chaveFiltros, pagina: numero });
    }

    // O resultado guarda a "chave" da busca: enquanto ela não bate com os
    // filtros e a página atuais, a busca ainda está carregando.
    const chaveBusca = JSON.stringify([chaveFiltros, pagina]);
    const [resultado, setResultado] = useState<{ chave: string; pets: Pet[]; totalPaginas: number; erro: string } | null>(null);

    useEffect(() => {
        let ativo = true;
        buscarAnimais({
            termo,
            especie: tipoAnimal ?? undefined,
            raca: racaEspecie || undefined,
            ...FAIXAS_PRECO[preco],
            idade: idade || undefined,
            page: pagina,
            size: TAMANHO_PAGINA
        })
            .then((resposta) => {
                if (ativo) setResultado({
                    chave: chaveBusca,
                    pets: resposta.conteudo.map(paraCardPet),
                    totalPaginas: resposta.totalPaginas,
                    erro: ""
                });
            })
            .catch((erro) => {
                if (ativo) setResultado({ chave: chaveBusca, pets: [], totalPaginas: 0, erro: mensagemDeErro(erro) });
            });
        return () => { ativo = false; };
    }, [chaveBusca, termo, tipoAnimal, racaEspecie, preco, idade, pagina]);

    const carregando = resultado?.chave !== chaveBusca;
    const erroBusca = carregando ? "" : resultado.erro;
    const pets = carregando ? [] : resultado.pets;
    const totalPaginas = resultado?.totalPaginas ?? 0;

    // RF09 — Adicionar ao carrinho (exige login)
    const adicionarCarrinho = useAdicionarAoCarrinho();
    

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

            <main className="productsClient">
                {imagemTitulo && (idiomaAtual() === "pt-BR" ? (
                    <div className="tituloProdutos">
                        <img
                            src={imagemTitulo}
                            alt={t("Produtos para {tipo}", { tipo: t(tipoAnimal ?? "") })}
                        />
                    </div>
                ) : <h1>{t(tipoAnimal ?? "")}</h1>)}

                    <div className="filtrosCampos">

                        {tipoAnimal && (
                            <div className="campoFiltro">

                                <select
                                    id="racaEspecie"
                                    value={racaEspecie}
                                    onChange={(event) =>
                                        setRacaEspecie(event.target.value)
                                    }
                                >
                                    <option value="">{t(rotuloDaRaca)}</option>

                                    {racas.map((opcao) => (
                                        <option key={opcao} value={opcao}>
                                            {t(opcao)}
                                        </option>
                                    ))}

                                </select>

                            </div>
                        )}

                        <div className="campoFiltro">

                            <select
                                id="idade"
                                value={idade}
                                onChange={(event) => setIdade(event.target.value)}
                            >
                                <option value="">{t("Idade")}</option>
                                <option value="Filhote">{t("Filhote")}</option>
                                <option value="Jovem">{t("Jovem")}</option>
                                <option value="Adulto">{t("Adulto")}</option>
                                <option value="Idoso">{t("Idoso")}</option>
                            </select>

                        </div>

                        <div className="campoFiltro">

                            <select
                                id="preco"
                                value={preco}
                                onChange={(event) => setPreco(event.target.value)}
                            >
                                <option value="">{t("Faixa de preço")}</option>
                                <option value="0-100">{t("Até R$ 100")}</option>
                                <option value="100-300">{t("R$ 100 a R$ 300")}</option>
                                <option value="300-500">{t("R$ 300 a R$ 500")}</option>
                                <option value="500-1000">{t("R$ 500 a R$ 1.000")}</option>
                                <option value="1000+">{t("Acima de R$ 1.000")}</option>
                            </select>

                        </div>

                    </div>

                    {termo && <p>{t("Resultados para \"")}{termo}"</p>}
                    {carregando && <p>{t("Carregando animais...")}</p>}
                    {erroBusca && <p role="alert">{t(erroBusca)}</p>}
                    {!carregando && !erroBusca && pets.length === 0 && (
                        <p>{t("Nenhum animal encontrado com esses filtros.")}</p>
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

                    {totalPaginas > 1 && (
                        <nav className="paginacao" aria-label={t("Paginação dos resultados")}>
                            <button
                                type="button"
                                onClick={() => irParaPagina(pagina - 1)}
                                disabled={carregando || pagina === 0}
                            >
                                {t("Anterior")}
                            </button>

                            <span>{t("Página") + " "}{pagina + 1}{" " + t("de") + " "}{totalPaginas}</span>

                            <button
                                type="button"
                                onClick={() => irParaPagina(pagina + 1)}
                                disabled={carregando || pagina + 1 >= totalPaginas}
                            >
                                {t("Próxima")}
                            </button>
                        </nav>
                    )}

            </main>

            {modalLaudo && petSelecionado && (
                <ModalLaudos
                    animalId={petSelecionado.id}
                    nome={petSelecionado.nome}
                    onFechar={fecharLaudo}
                />
            )}

        </div>
    );
}

export default Products;
