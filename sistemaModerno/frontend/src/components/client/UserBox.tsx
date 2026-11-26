import MenuUsuario from "./MenuUsuario";

/**
 * Área do usuário no cabeçalho das páginas do cliente (classe CSS original: userBox).
 * O nome abre o menu com perfil, pedidos e Sair.
 */
function UserBox() {
    return (
        <div className="userBox">
            <MenuUsuario
                icone={
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                        <path
                            d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                }
            />
        </div>
    );
}

export default UserBox;
