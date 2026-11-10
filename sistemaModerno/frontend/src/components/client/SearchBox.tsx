import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * RF07 — Caixa de busca do cabeçalho. Envia para /Products?termo=...
 * Mantém as classes CSS originais (searchBox) das páginas do cliente.
 */
function SearchBox() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [termo, setTermo] = useState(searchParams.get("termo") ?? "");

    function pesquisar(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const valor = termo.trim();
        navigate(valor ? `/Products?termo=${encodeURIComponent(valor)}` : "/Products");
    }

    return (
        <form className="searchBox" onSubmit={pesquisar} role="search">

            <input
                type="text"
                placeholder="Buscar"
                aria-label="Buscar animais"
                value={termo}
                onChange={(event) => setTermo(event.target.value)}
            />

            <button type="submit" aria-label="Pesquisar">
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

        </form>
    );
}

export default SearchBox;
