import { useNavigate } from "react-router-dom";
import { adicionarAoCarrinho } from "../services/carrinho";
import { mensagemDeErro, naoAutenticado } from "../services/api";

/**
 * RF09 — "Adicionar ao carrinho" usado pelos cards de animal.
 * Sem login, leva o visitante para a página de login.
 */
export function useAdicionarAoCarrinho() {
    const navigate = useNavigate();

    return async function adicionar(animal: { id: string; nome: string }): Promise<void> {
        try {
            await adicionarAoCarrinho(animal.id);
            alert(`${animal.nome} foi adicionado ao carrinho!`);
        } catch (erro) {
            if (naoAutenticado(erro)) {
                navigate("/login");
                return;
            }
            alert(mensagemDeErro(erro));
        }
    };
}
