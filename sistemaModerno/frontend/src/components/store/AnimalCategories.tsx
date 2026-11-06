import { Link } from "react-router-dom";
import "./AnimalCategories.css";

import papagaio from "../../assets/imagens/animais/papagaio.png";
import peixe from "../../assets/imagens/animais/peixe.png";
import passaro from "../../assets/imagens/animais/passaro.png";
import cachorro from "../../assets/imagens/animais/cachorro.png";
import gato from "../../assets/imagens/animais/gato.png";
import reptil from "../../assets/imagens/animais/reptil.png";

import { FaPaw } from "react-icons/fa";

const categories = [
    {
        name: "Peixes",
        image: peixe,
        slug: "peixes",
        position: "peixes"
    },
    {
        name: "Pássaros",
        image: passaro,
        slug: "passaros",
        position: "passaros"
    },
    {
        name: "Cães",
        image: cachorro,
        slug: "caes",
        position: "caes"
    },
    {
        name: "Gatos",
        image: gato,
        slug: "gatos",
        position: "gatos"
    },
    {
        name: "Répteis",
        image: reptil,
        slug: "repteis",
        position: "repteis"
    }
];

function AnimalCategories() {
    return (
        <section className="animalCategories">

            <div className="categoryContent">

                <div className="paw paw1"><FaPaw /></div>
                <div className="paw paw2"><FaPaw /></div>
                <div className="paw paw3"><FaPaw /></div>
                <div className="paw paw4"><FaPaw /></div>

                {/* Linhas de conexão */}
                <svg
                    className="categoryLines"
                    viewBox="0 0 1000 600"
                    preserveAspectRatio="none"
                >
                    {/* Linhas Desktop */}
                    <g className="desktopLines">
                        <line x1="500" y1="230" x2="133" y2="345" />
                        <line x1="500" y1="230" x2="867" y2="345" />
                        <line x1="500" y1="230" x2="253" y2="510" />
                        <line x1="500" y1="230" x2="747" y2="510" />
                        <line x1="500" y1="230" x2="500" y2="560" />
                    </g>

                    {/* Linhas Mobile */}
                    <g className="mobileLines">
                        <line x1="500" y1="210" x2="50" y2="240" />
                        <line x1="500" y1="210" x2="950" y2="240" />
                        <line x1="500" y1="210" x2="200" y2="510" />
                        <line x1="500" y1="210" x2="800" y2="510" />
                        <line x1="500" y1="210" x2="500" y2="550" />
                    </g>
                </svg>

                {/* Animal central */}
                <div className="centralAnimal">
                    <img src={papagaio} alt="Papagaio" />
                </div>

                {/* Categorias */}
                {categories.map((category) => (
                    <Link
                        to={`/produtos?categoria=${category.slug}`}
                        className={`animalCategory ${category.position}`}
                        key={category.slug}
                    >
                        <img
                            src={category.image}
                            alt={category.name}
                        />

                        <span>{category.name}</span>
                    </Link>
                ))}

            </div>

        </section>
    );
}

export default AnimalCategories;