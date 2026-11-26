import { t } from "../../services/idioma";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obterSessao } from "../../services/api";
import { logout } from "../../services/auth";

/**
 * Nome do usuário no cabeçalho, como no design ("Nome: Fulano"). Ao clicar, abre o menu
 * com perfil, pedidos e Sair (RF10). No painel do administrador (admin), só Sair.
 * Sem sessão, mostra o link para entrar.
 */
function MenuUsuario({ icone, admin = false }: { icone?: ReactNode; admin?: boolean }) {
    const navigate = useNavigate();
    const sessao = obterSessao();
    const [aberto, setAberto] = useState(false);
    const area = useRef<HTMLDivElement>(null);

    // Fecha ao clicar fora ou apertar Esc.
    useEffect(() => {
        if (!aberto) return;
        const fecharFora = (e: MouseEvent) => {
            if (!area.current?.contains(e.target as Node)) setAberto(false);
        };
        const fecharEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setAberto(false);
        };
        document.addEventListener("mousedown", fecharFora);
        document.addEventListener("keydown", fecharEsc);
        return () => {
            document.removeEventListener("mousedown", fecharFora);
            document.removeEventListener("keydown", fecharEsc);
        };
    }, [aberto]);

    async function sair(): Promise<void> {
        setAberto(false);
        await logout();
        navigate("/login");
    }

    if (!sessao) {
        return <>{icone}<Link to="/login" className="menuUsuarioEntrar">{t("Entrar")}</Link></>;
    }

    return (
        <div className="menuUsuario" ref={area}>

            <button
                type="button"
                className="menuUsuarioBotao"
                aria-haspopup="menu"
                aria-expanded={aberto}
                onClick={() => setAberto((atual) => !atual)}
            >
                {icone}
                <span>
                    <strong>{t("Nome:")}</strong> {sessao.usuario.nome}
                </span>
            </button>

            {aberto && (
                <div className="menuUsuarioLista" role="menu">
                    {!admin && <>
                        <Link to="/ProfilePage" role="menuitem" onClick={() => setAberto(false)}>{t("Meu perfil")}</Link>
                        <Link to="/Orders" role="menuitem" onClick={() => setAberto(false)}>{t("Meus pedidos")}</Link>
                    </>}
                    <button type="button" role="menuitem" onClick={() => void sair()}>{t("Sair")}</button>
                </div>
            )}

        </div>
    );
}

export default MenuUsuario;
