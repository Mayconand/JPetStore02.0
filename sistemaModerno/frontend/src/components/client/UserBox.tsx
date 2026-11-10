import { Link, useNavigate } from "react-router-dom";
import { obterSessao } from "../../services/api";
import { logout } from "../../services/auth";

/**
 * Área do usuário no cabeçalho: mostra o nome de quem está logado e o botão
 * de sair (RF10). Sem sessão, mostra o link para entrar.
 * Mantém a classe CSS original (userBox) das páginas do cliente.
 */
function UserBox() {
    const navigate = useNavigate();
    const sessao = obterSessao();

    async function sair(): Promise<void> {
        await logout();
        navigate("/login");
    }

    return (
        <div className="userBox">

            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path
                    d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>

            {sessao ? (
                <>
                    <span>
                        <strong>Nome:</strong> {sessao.usuario.nome}
                    </span>

                    <button type="button" className="btnSair" onClick={sair}>
                        Sair
                    </button>
                </>
            ) : (
                <Link to="/login">Entrar</Link>
            )}

        </div>
    );
}

export default UserBox;
