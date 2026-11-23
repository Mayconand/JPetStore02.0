
import { useEffect, useState } from "react";
import "./SpecificProduct.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { Link, useSearchParams } from "react-router-dom";
import SearchBox from "../../components/client/SearchBox";
import UserBox from "../../components/client/UserBox";
import ModalLaudos from "../../components/ModalLaudos";
import { useAdicionarAoCarrinho } from "../../hooks/useAdicionarAoCarrinho";
import { fotoOuPadrao, obterFicha } from "../../services/animais";
import type { FichaAnimal } from "../../services/animais";
import { baixarLaudo } from "../../services/laudos";
import { mensagemDeErro, obterSessao, urlDoArquivo } from "../../services/api";

const ROTULOS: Record<string, string> = {
    porte: "Porte",
    pelagem: "Pelagem",
    altura: "Altura (cm)",
    peso: "Peso (kg)",
    plumagem: "Plumagem",
    tipoDeAgua: "Tipo de água",
    estirpe: "Estirpe",
    ph: "PH",
    expectativaDeVida: "Expectativa de vida",
    grupo: "Grupo",
    mutacao: "Mutação"
};

/** Códigos do backend -> texto da tela. */
const VALORES: Record<string, string> = {
    PEQUENO: "Pequeno", MEDIO: "Médio", GRANDE: "Grande",
    DOCE: "Doce", SALGADA: "Salgada",
    SERPENTES: "Serpentes", LAGARTOS: "Lagartos", QUELONIOS: "Quelônios", CROCODILIANOS: "Crocodilianos"
};

type GalleryItem = {
    url: string;
    nome: string;
    tipo?: "imagem" | "pdf";
};

function Gallery({
    titulo,
    items,
    tipo
}: {
    titulo: string;
    items: GalleryItem[];
    tipo: "foto" | "laudo";
}) {

    const [indice, setIndice] = useState(0);

    const anterior = () => {
        setIndice((atual) =>
            (atual - 1 + items.length) % items.length
        );
    };

    const proximo = () => {
        setIndice((atual) =>
            (atual + 1) % items.length
        );
    };

    const itemAtual = items[indice];

    return (
        <div className="galleryContainer">

            <div className="galleryTitle">
                <hr />
                <h3>{titulo}</h3>
                <hr />
            </div>

            <div className="galleryContent">

                <button
                    className="galleryArrow"
                    type="button"
                    onClick={anterior}
                    disabled={items.length <= 1}
                    aria-label={`Anterior ${titulo}`}
                >
                    &#8249;
                </button>

                <div className="galleryDisplay">

                    {itemAtual ? (
                        itemAtual.tipo === "pdf" ? (
                            <iframe
                                src={itemAtual.url}
                                title={itemAtual.nome}
                                className="galleryPdf"
                            />
                        ) : (
                            <img
                                src={itemAtual.url}
                                alt={itemAtual.nome}
                                className="galleryImage"
                            />
                        )
                    ) : (
                        <p className="galleryEmpty">
                            Nenhum {tipo === "foto" ? "registro de foto" : "laudo"} cadastrado.
                        </p>
                    )}

                </div>

                <button
                    className="galleryArrow"
                    type="button"
                    onClick={proximo}
                    disabled={items.length <= 1}
                    aria-label={`Próximo ${titulo}`}
                >
                    &#8250;
                </button>

            </div>

            {items.length > 0 && (
                <span className="galleryCounter">
                    {indice + 1} / {items.length}
                </span>
            )}

        </div>
    );
}

/** RF16 — ficha do animal (/SpecificProduct?id=...); RF26 — laudos na visão do cliente. */
function SpecificProduct() {

    const [parametros] = useSearchParams();
    const id = parametros.get("id") ?? "";

    // A chave recomeça do zero ao trocar de animal.
    return <Ficha key={id} id={id} />;
}

function Ficha({ id }: { id: string }) {

    const [animal, setAnimal] = useState<FichaAnimal | null>(null);
    const [aviso, setAviso] = useState(id ? "Carregando..." : "Escolha um animal na lista para ver a ficha.");
    const [laudos, setLaudos] = useState<GalleryItem[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const adicionarCarrinho = useAdicionarAoCarrinho();
    const logado = obterSessao() !== null;

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        obterFicha(id)
            .then((ficha) => ativo && setAnimal(ficha))
            .catch((e) => ativo && setAviso(mensagemDeErro(e)));
        return () => { ativo = false; };
    }, [id]);

    // Os PDFs exigem login.
    useEffect(() => {
        if (!animal || !logado) return;
        let ativo = true;
        const criados: string[] = [];
        const comPdf = animal.laudos.filter((laudo) => laudo.arquivoUrl);
        Promise.all(comPdf.map(async (laudo): Promise<GalleryItem> => {
            const url = URL.createObjectURL(await baixarLaudo(laudo.arquivoUrl!));
            criados.push(url);
            return { url, nome: laudo.titulo, tipo: "pdf" };
        }))
            .then((itens) => ativo && setLaudos(itens))
            .catch(() => ativo && setLaudos([])); // o botão "Laudos" mostra o erro de cada um
        return () => {
            ativo = false;
            criados.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [animal, logado]);

    if (!animal) return <div className="container"><p>{aviso}</p></div>;

    const fotos: GalleryItem[] = animal.imagens.map((url, i) => ({ url: urlDoArquivo(url), nome: `${animal.nome} ${i + 1}` }));
    const atributos = Object.entries(animal.atributos).filter(([, valor]) => valor !== null);

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

            <h1>Perfil de {animal.nome}</h1>

            <section className="productSection">

                <div className="productDetails">

                    <div className="productImage">
                        <img
                            src={fotoOuPadrao(animal.imagens[0], animal.especie)}
                            alt={`${animal.nome}, ${animal.raca.nome}`}
                        />
                    </div>

                    <div className="productInfo">

                        <p><strong>Nome:</strong> {animal.nome}</p>

                        <p>
                            <strong>Raça:</strong> {animal.raca.nome}
                        </p>

                        <p><strong>Ficha:</strong></p>

                        <p>Nascimento: {animal.dataNascimento ? animal.dataNascimento.split("-").reverse().join("/") : "Não informado"}</p>

                        {atributos.map(([campo, valor]) => (
                            <p key={campo}>{ROTULOS[campo] ?? campo}: {VALORES[String(valor)] ?? String(valor)}</p>
                        ))}

                        <div className="productTags">

                            <p><strong>TAGs:</strong></p>

                            <div className="tags">
                                {animal.tags.map((tag, i) => (
                                    <span key={tag} className={`tag ${i % 2 ? "tagYellow" : "tagPink"}`}>#{tag}</span>
                                ))}
                            </div>

                        </div>

                    </div>

                </div>

                <div className="productActions">

                    <button
                        type="button"
                        className="btn_laudos"
                        onClick={() => setModalAberto(true)}
                    >
                        Laudos
                    </button>

                    <button
                        type="button"
                        className="btn_carrinho"
                        onClick={() => void adicionarCarrinho(animal)}
                    >
                        <span className="material-symbols-outlined">
                            shopping_cart
                        </span>

                        Adicionar ao carrinho
                    </button>

                </div>

            </section>

            <section className="docsSection">

                <Gallery
                    titulo="Fotos"
                    items={fotos}
                    tipo="foto"
                />

                <Gallery
                    titulo="Laudos"
                    items={laudos}
                    tipo="laudo"
                />

            </section>

            {modalAberto && (
                <ModalLaudos
                    animalId={animal.id}
                    nome={animal.nome}
                    onFechar={() => setModalAberto(false)}
                />
            )}

        </div>
    );
}

export default SpecificProduct;
