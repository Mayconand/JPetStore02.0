
import { useState } from "react";
import "./SpecificProduct.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import { Link } from "react-router-dom";

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

function SpecificProduct() {

    const fotos: GalleryItem[] = [];

    const laudos: GalleryItem[] = [];

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

            <h1>Perfil de Snoopy</h1>

            <section className="productSection">

                <div className="productDetails">

                    <div className="productImage">
                        <img
                            src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"
                            alt="Snoopy, cachorro da raça Labrador"
                        />
                    </div>

                    <div className="productInfo">

                        <p><strong>Nome:</strong> Snoopy</p>

                        <p>
                            <strong>Raça:</strong> Labrador retriever
                        </p>

                        <p><strong>Ficha:</strong></p>

                        <p>Nascimento: 31/08/2020</p>

                        <p>Porte: Médio</p>

                        <div className="productTags">

                            <p><strong>TAGs:</strong></p>

                            <div className="tags">
                                <span className="tag tagPink">#labrador</span>
                                <span className="tag tagPink">#retriever</span>
                                <span className="tag tagPink">#cachorro</span>
                                <span className="tag tagYellow">#amigável</span>
                                <span className="tag tagYellow">#brincalhão</span>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="productActions">

                    <button
                        type="button"
                        className="btn_laudos"
                    >
                        Laudos
                    </button>

                    <button
                        type="button"
                        className="btn_carrinho"
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

        </div>
    );
}

export default SpecificProduct;
