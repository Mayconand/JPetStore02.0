
import { useState } from "react";
import type {
    ChangeEvent,
    FormEvent,
    MouseEvent
} from "react";

import "./HomeClient.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import slidehomeclient from "../../assets/imagens/slidehomeclient.png";
import pata from "../../assets/imagens/pata.png";
import iconemenufavorito from "../../assets/imagens/iconemenufavorito.png";
import slideCachorro from "../../assets/imagens/animais/slideCachorroHomeClient.png";
import slideGato from "../../assets/imagens/animais/slideGatoHomeClient.png";
import slideReptil from "../../assets/imagens/animais/slideReptilHomeClient.png";
import slidePassaro from "../../assets/imagens/animais/slidePassaroHomeClient.png";
import slidePeixe from "../../assets/imagens/animais/slidePeixeHomeClient.png";

import { Link } from "react-router-dom";

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

    Réptil: {
        label: "Espécie",
        opcoes: [
            "Iguana",
            "Jabuti",
            "Gecko",
            "Camaleão",
            "Cobra"
        ]
    },

    Pássaro: {
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

type TipoAnimal = keyof typeof opcoesAnimais;

type Pet = typeof pets[number];

interface Favorito {
    id: number;
    tipo: TipoAnimal;
    racaEspecie: string;
    categoria: string;
}


function HomeClient() {

    // Modal de laudos
    const [modalLaudo, setModalLaudo] = useState<boolean>(false);
    const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);

    // Menu lateral
    const [menuAberto, setMenuAberto] = useState<boolean>(false);

    // Favoritos
    const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal | "">("");
    const [racaEspecie, setRacaEspecie] = useState<string>("");

    const [favoritos, setFavoritos] = useState<Favorito[]>([]);

    

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

    function salvarFavorito(
        event: FormEvent<HTMLFormElement>
    ): void {

        event.preventDefault();

        if (!tipoAnimal || !racaEspecie) {
            return;
        }

        const jaExiste = favoritos.some(
            (favorito) =>
                favorito.tipo === tipoAnimal &&
                favorito.racaEspecie === racaEspecie
        );

        if (jaExiste) {
            alert("Esse animal já está nos seus favoritos!");
            return;
        }

        const novoFavorito: Favorito = {
            id: Date.now(),
            tipo: tipoAnimal,
            racaEspecie: racaEspecie,
            categoria: opcoesAnimais[tipoAnimal].label
        };

        setFavoritos((anteriores) => [
            ...anteriores,
            novoFavorito
        ]);

        setTipoAnimal("");
        setRacaEspecie("");
    }


    function removerFavorito(id: number): void {

        setFavoritos((anteriores) =>
            anteriores.filter(
                (favorito) => favorito.id !== id
            )
        );
    }


    function impedirFechamento(
        event: MouseEvent<HTMLDivElement>
    ): void {
        event.stopPropagation();
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


            <main>

                <section className="presentationHomeClient">

                    <div className="presentationTitle">

                        <img
                            src={pata}
                            alt="Pata"
                            className="paw pawLeft"
                        />

                        <h1>SEU MELHOR AMIGO ESTA AQUI!</h1>

                        <img
                            src={pata}
                            alt="Pata"
                            className="paw pawRight"
                        />

                    </div>

                    <div className="presentationImage">

                        <Link to="">
                            <img
                                src={slideCachorro}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="">
                            <img
                                src={slideGato}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="">
                            <img
                                src={slideReptil}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="">
                            <img
                                src={slidePassaro}  
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="">
                            <img
                                src={slidePeixe}
                                alt="Apresentação"
                            />
                        </Link>
                    </div>

                </section>


                <section className="filterConteiner">

                    <h2>Conheça eles</h2>

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

                </section>

            </main>

            {modalLaudo && petSelecionado && (

                <div
                    className="modalOverlay"
                    onClick={fecharLaudo}
                >

                    <div
                        className="modalLaudo"
                        onClick={impedirFechamento}
                    >

                        <div className="modalHeader">

                            <h2>Laudos - {petSelecionado.nome}</h2>

                            <button
                                type="button"
                                className="btnFecharModal"
                                onClick={fecharLaudo}
                                aria-label="Fechar laudo"
                            >
                                ×
                            </button>

                        </div>

                        <div className="modalPdf">

                            <span>PDF</span>

                            <p>
                                Visualização do laudo de {petSelecionado.nome}
                            </p>

                        </div>

                    </div>

                </div>

            )}

            <button
                type="button"
                className="btnMenuFavoritos"
                onClick={abrirMenu}
                aria-label="Abrir menu de animais favoritos"
            >

                <img
                    src={iconemenufavorito}
                    alt="Ícone de menu de favoritos"
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
                aria-hidden={!menuAberto}
            >


                <div className="menuFavoritosHeader">

                    <div>

                        <h3>Pet Favorito</h3>

                        <p>
                            Encontre aqui mais dos seus pets favoritos.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={fecharMenu}
                        aria-label="Fechar menu"
                    >
                        ×
                    </button>

                </div>

                <div className="menuFavoritosConteudo">


                    <div
                        className={`listaFavoritos ${
                            favoritos.length > 3
                                ? "listaFavoritosScroll"
                                : ""
                        }`}
                    >

                        {favoritos.length === 0 ? (

                            <p className="semFavoritos">
                                Você ainda não possui animais favoritos.
                            </p>

                        ) : (

                            favoritos.map((favorito) => (

                                <div
                                    className="favoritoItem"
                                    key={favorito.id}
                                >

                                    <div className="favoritoInfo">

                                        <strong>
                                            {favorito.tipo}: 
                                        </strong>

                                        <span>
                                            {favorito.racaEspecie}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removerFavorito(favorito.id)}
                                        aria-label={`Remover ${favorito.racaEspecie}`}
                                    >
                                        ×
                                    </button>

                                </div>

                            ))

                        )}

                    </div>


                    <form
                        className="formFavoritos"
                        onSubmit={salvarFavorito}
                    >


                        <div className="campoFavorito">

                            <label htmlFor="tipoAnimal">
                                Tipo
                            </label>

                            <select
                                id="tipoAnimal"
                                value={tipoAnimal}
                                onChange={alterarTipoAnimal}
                                required
                            >

                                <option value="">
                                    Selecione
                                </option>

                                <option value="Cachorro">
                                    Cachorro
                                </option>

                                <option value="Gato">
                                    Gato
                                </option>

                                <option value="Réptil">
                                    Réptil
                                </option>

                                <option value="Pássaro">
                                    Pássaro
                                </option>

                                <option value="Peixe">
                                    Peixe
                                </option>

                            </select>

                        </div>

                        {tipoAnimal && (

                            <div className="campoFavorito">

                                <label htmlFor="racaEspecie">
                                    {opcoesAnimais[tipoAnimal].label}
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
                                        Selecione
                                    </option>

                                    {opcoesAnimais[tipoAnimal].opcoes.map(
                                        (opcao) => (

                                            <option
                                                value={opcao}
                                                key={opcao}
                                            >
                                                {opcao}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        )}


                        <button
                            type="submit"
                            className="btnSalvarFavorito"
                            disabled={!tipoAnimal || !racaEspecie}
                        >
                            Salvar
                        </button>

                    </form>

                </div>

            </aside>

            <footer>
                    <div className="footerInfo">
                        <img
                            src={logo}
                            alt="Logo JPetStore"
                            className="logo"
                        />
                        <p>Encontre seu companheiro ideal e descubra o amor que só um pet pode oferecer.</p>
                        <Link to="/cadastroUser" className="btnCadastro">
                            Cadastre-se
                        </Link>
                    </div>

                    <div className="footerLinks">
                        <h4><Link to="">Inicio</Link></h4>
                        <div>
                            <h4><Link to="">Cachorros</Link></h4>
                            <ul>
                                <li><Link to="">Porte Grande</Link></li>
                                <li><Link to="">Porte Medio</Link></li>
                                <li><Link to="">Porte Pequeno</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4><Link to="">Gatos</Link></h4>
                            <ul>
                                <li><Link to="">Porte Grande</Link></li>
                                <li><Link to="">Porte Medio</Link></li>
                                <li><Link to="">Porte Pequeno</Link></li>
                            </ul>
                        </div>

                        <h4><Link to="">Repteis</Link></h4>

                        <h4><Link to="">Passaros</Link></h4>

                        <h4><Link to="">Peixes</Link></h4>

                    </div>

            </footer>

        </div>

        

    );
}

export default HomeClient;
