import { useSearchParams } from "react-router-dom";
import { useState } from "react";
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


type Pet = typeof pets[number];

const pets = [
    {
        id: 1,
        nome: "Snoopy",
        raca: "Labrador retriever",
        nascimento: "31/08/2020",
        sexo: "Macho",
        castrado: "Não",
        imagem: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
        tags: ["Amigável", "Brincalhão", "Carinhoso"],
        status: "Laudos"
    },
    {
        id: 2,
        nome: "Luke",
        raca: "Pastor Alemão",
        nascimento: "31/08/2020",
        sexo: "Macho",
        castrado: "Não",
        imagem: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400",
        tags: ["Protetor", "Ativo", "Inteligente"],
        status: "Laudos"
    },
    {
        id: 3,
        nome: "Chico",
        raca: "Labrador retriever",
        nascimento: "30/08/2020",
        sexo: "Macho",
        castrado: "Não",
        imagem: "https://i0.statig.com.br/bancodeimagens/7i/lu/5a/7ilu5ad3a5usexlc3dhb1avho.jpg?w=400",
        tags: ["Dócil", "Amigável", "Calmo"],
        status: "Laudos"
    },
    {
        id: 4,
        nome: "Vanda",
        raca: "Persa",
        nascimento: "20/08/2022",
        sexo: "Fêmea",
        castrado: "Não",
        imagem: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
        tags: ["Tranquila", "Carinhosa", "Sociável"],
        status: "Laudos"
    },
    {
        id: 5,
        nome: "Luke",
        raca: "Siamês",
        nascimento: "12/05/2020",
        sexo: "Macho",
        castrado: "Não",
        imagem: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400",
        tags: ["Curioso", "Ativo", "Dócil"],
        status: "Laudos"
    },
    {
        id: 6,
        nome: "Chico",
        raca: "Labrador retriever",
        nascimento: "30/08/2020",
        sexo: "Macho",
        castrado: "Não",
        imagem: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
        tags: ["Calmo", "Amigável", "Carinhoso"],
        status: "Laudos"
    }
];

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
    

    return (
        <div className="container">

            <header className="headerClient">

                    <img
                        src={logo}
                        alt="Logo JPetStore"
                        className="logo"
                    />

                    <nav className="headerNav">

                        <div className="searchBox">

                            <input
                                type="text"
                                placeholder="Buscar"
                                aria-label="Buscar animais"
                            />

                            <button
                                type="button"
                                aria-label="Pesquisar"
                            >
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

                    <div className="petsGrid">

                            {pets.map((pet) => (

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
                                                {pet.status}
                                            </button>

                                            <button
                                                type="button"
                                                className="btnAddCart"
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


            </main>

            
            
        </div>
    );
}

export default Products;