import { Navigate, Outlet } from "react-router-dom";
import { obterSessao } from "../services/api";

/** RNF05 — só administradores veem o painel (o backend também confere em cada requisição). */
function RotaAdmin() {
    const sessao = obterSessao();

    if (!sessao) return <Navigate to="/login" replace />;
    if (sessao.usuario.papel !== "ADMIN") return <Navigate to="/HomeClient" replace />;
    return <Outlet />;
}

export default RotaAdmin;
