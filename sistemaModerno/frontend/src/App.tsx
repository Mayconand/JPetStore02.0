import './App.css'
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { definirIdioma, useIdioma } from "./services/idioma";
import { obterSessao } from "./services/api";
import { obterPerfil } from "./services/usuarios";
import AppRoutes from "./routes/AppRoutes";


function App() {
    const idioma = useIdioma();
    useLocation();
    const usuario = obterSessao()?.usuario.id;

    useEffect(() => {
        document.documentElement.lang = idioma;
    }, [idioma]);

    useEffect(() => {
        if (!usuario) return;
        let ativo = true;
        obterPerfil().then(perfil => { if (ativo) definirIdioma(perfil.idiomaPreferencial); }).catch(() => {});
        return () => { ativo = false; };
    }, [usuario]);

    return (
        <AppRoutes />
    );
}

export default App;
