import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type {
    ChangeEvent,
    FormEvent,
    MouseEvent
} from "react";

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
import { buscarAnimais, paraCardPet } from "../../services/animais";
import type { CardPet } from "../../services/animais";
import { mensagemDeErro } from "../../services/api";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";


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

/** Faixa etária a partir da data de nascimento (filtro "Idade", aplicado na página carregada). */
function faixaEtaria(dataNascimento: string | null): string {
    if (!dataNascimento) return "";
    const anos = (Date.now() - new Date(`${dataNascimento}T00:00:00`).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (anos < 1) return "Filhote";
    if (anos < 3) return "Jovem";
    if (anos < 8) return "Adulto";
    return "Idoso";
}




function Products() {

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

    const opcoesAnimais = {
        Cachorro: {
            label: "Raça",
            opcoes: [
                "Labrador Retriever",
                "Pastor Alemão",
                "Golden Retriever",
                "Poodle",
                "Bulldog",
                "Shih Tzu",
                "Pinscher",
                "Rottweiler"
            ]
        },

        Gato: {
            label: "Raça",
            opcoes: [
                "Persa",
                "Siamês",
                "Maine Coon",
                "Angorá",
                "Sphynx",
                "Bengal"
            ]
        },

        Reptil: {
            label: "Espécie",
            opcoes: [
                "Iguana",
                "Jabuti",
                "Gecko",
                "Camaleão",
                "Cobra"
            ]
        },

        Passaro: {
            label: "Espécie",
            opcoes: [
                "Calopsita",
                "Canário",
                "Papagaio",
                "Periquito",
                "Arara"
            ]
        },

        Peixe: {
            label: "Espécie",
            opcoes: [
                "Betta",
                "Peixe-palhaço",
                "Kinguios",
                "Guppy",
                "Acará-disco"
            ]
        }
    };

    const configuracaoAnimal = tipoAnimal
        ? opcoesAnimais[tipoAnimal as keyof typeof opcoesAnimais]
        : null;

    const [racaEspecie, setRacaEspecie] = useState("");
    const [idade, setIdade] = useState("");
    const [preco, setPreco] = useState("");


    // RF07 — Buscar Animais com os filtros da tela, paginado.
    // A página volta para a primeira sempre que um filtro muda.
    const chaveFiltros = JSON.stringify([termo, tipoAnimal, racaEspecie, preco]);
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
    }, [chaveBusca, termo, tipoAnimal, racaEspecie, preco, pagina]);

    const carregando = resultado?.chave !== chaveBusca;
    const erroBusca = carregando ? "" : resultado.erro;
    const pets = carregando ? [] : resultado.pets;
    const totalPaginas = resultado?.totalPaginas ?? 0;
    // "Idade" é calculada a partir do nascimento e filtra apenas a página carregada.
    const petsFiltrados = idade ? pets.filter((pet) => faixaEtaria(pet.dataNascimento) === idade) : pets;

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

            <main className="productsClient">
                {imagemTitulo && (
                    <div className="tituloProdutos">
                        <img
                            src={imagemTitulo}
                            alt={`Produtos para ${tipoAnimal}`}
                        />
                    </div>
                )}

                    <div className="filtrosCampos">

                        {configuracaoAnimal && (
                            <div className="campoFiltro">

                                <select
                                    id="racaEspecie"
                                    value={racaEspecie}
                                    onChange={(event) =>
                                        setRacaEspecie(event.target.value)
                                    }
                                >
                                    <option value="">{configuracaoAnimal.label}</option>

                                    {configuracaoAnimal.opcoes.map((opcao) => (
                                        <option key={opcao} value={opcao}>
                                            {opcao}
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
                                <option value="">Idade</option>
                                <option value="Filhote">Filhote</option>
                                <option value="Jovem">Jovem</option>
                                <option value="Adulto">Adulto</option>
                                <option value="Idoso">Idoso</option>
                            </select>

                        </div>

                        <div className="campoFiltro">

                            <select
                                id="preco"
                                value={preco}
                                onChange={(event) => setPreco(event.target.value)}
                            >
                                <option value="">Faixa de preço</option>
                                <option value="0-100">Até R$ 100</option>
                                <option value="100-300">R$ 100 a R$ 300</option>
                                <option value="300-500">R$ 300 a R$ 500</option>
                                <option value="500-1000">R$ 500 a R$ 1.000</option>
                                <option value="1000+">Acima de R$ 1.000</option>
                            </select>

                        </div>

                    </div>

                    {termo && <p>Resultados para "{termo}"</p>}
                    {carregando && <p>Carregando animais...</p>}
                    {erroBusca && <p role="alert">{erroBusca}</p>}
                    {!carregando && !erroBusca && petsFiltrados.length === 0 && (
                        <p>Nenhum animal encontrado com esses filtros.</p>
                    )}

                    <div className="petsGrid">

                            {petsFiltrados.map((pet) => (

                                <article className="petCard" key={pet.id}>

                                    <div className="petImage">

                                        <img
                                            src={pet.imagem}
                                            alt={pet.nome}
                                        />

                                    </div>

                                    <div className="petInformation">

                                        <div className="petTitle">

                                            <h3>{pet.nome}</h3>

                                        </div>

                                        <div className="petDetails">

                                            <p>
                                                <strong>Raça:</strong> {pet.raca}
                                            </p>

                                            <p>
                                                <strong>Ficha:</strong>
                                            </p>

                                            <p>
                                                <strong>Nascimento:</strong> {pet.nascimento}
                                            </p>

                                            <p>
                                                <strong>Criador:</strong> Nome
                                            </p>

                                            <p>
                                                <strong>Proprietário:</strong> Nome
                                            </p>

                                        </div>

                                        <div className="petTags">

                                            <span className="tagTitle">
                                                TAGs:
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
                                                Laudos
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

                                                Adicionar ao carrinho

                                            </button>

                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>

                    {totalPaginas > 1 && (
                        <nav className="paginacao" aria-label="Paginação dos resultados">
                            <button
                                type="button"
                                onClick={() => irParaPagina(pagina - 1)}
                                disabled={carregando || pagina === 0}
                            >
                                Anterior
                            </button>

                            <span>Página {pagina + 1} de {totalPaginas}</span>

                            <button
                                type="button"
                                onClick={() => irParaPagina(pagina + 1)}
                                disabled={carregando || pagina + 1 >= totalPaginas}
                            >
                                Próxima
                            </button>
                        </nav>
                    )}

            </main>

            
            
        </div>
    );
}

export default Products;