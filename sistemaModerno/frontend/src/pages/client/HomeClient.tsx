
import { useEffect, useState } from "react";
import type {
    ChangeEvent,
    FormEvent,
    MouseEvent
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
import { buscarAnimais, paraCardPet } from "../../services/animais";
import type { CardPet } from "../../services/animais";
import { mensagemDeErro } from "../../services/api";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";

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



type TipoAnimal = keyof typeof opcoesAnimais;

type Pet = CardPet;

interface Favorito {
    id: number;
    tipo: TipoAnimal;
    racaEspecie: string;
    categoria: string;
}


function HomeClient() {

    const [modalLaudo, setModalLaudo] = useState<boolean>(false);
    const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);

    const [menuAberto, setMenuAberto] = useState<boolean>(false);

    const [tipoAnimal, setTipoAnimal] = useState<TipoAnimal | "">("");
    const [racaEspecie, setRacaEspecie] = useState<string>("");

    const [favoritos, setFavoritos] = useState<Favorito[]>([]);

    const [pets, setPets] = useState<Pet[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erroBusca, setErroBusca] = useState<string>("");

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

                        <Link to="/Products?tipo=Cachorro">
                            <img
                                src={slideCachorro}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="/Products?tipo=Gato">
                            <img
                                src={slideGato}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="/Products?tipo=Reptil">
                            <img
                                src={slideReptil}
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="/Products?tipo=Passaro">
                            <img
                                src={slidePassaro}  
                                alt="Apresentação"
                            />
                        </Link>
                        <Link to="/Products?tipo=Peixe">
                            <img
                                src={slidePeixe}
                                alt="Apresentação"
                            />
                        </Link>
                    </div>

                </section>


                <section className="filterConteiner">

                    <h2>Conheça eles</h2>

                    {carregando && <p>Carregando animais...</p>}
                    {erroBusca && <p role="alert">{erroBusca}</p>}
                    {!carregando && !erroBusca && pets.length === 0 && (
                        <p>Nenhum animal disponível no momento.</p>
                    )}

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
