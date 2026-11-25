import { t } from "../../services/idioma";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cancelarPedido, type Pedido } from "../../services/pedidos";
import { mensagemDeErro, naoAutenticado } from "../../services/api";

export default function AcoesPedido({ pedido, atualizar }: { pedido: Pedido; atualizar: (pedido: Pedido) => void }) {
    const navigate = useNavigate();
    const [cancelando, setCancelando] = useState(false);
    const [erro, setErro] = useState("");
    const pendente = pedido.status === "AGUARDANDO_PAGAMENTO";
    if (!pendente && pedido.status !== "PAGO") return null;

    async function cancelar() {
        if (!window.confirm(t("Deseja cancelar este pedido?"))) return;
        setCancelando(true);
        setErro("");
        try {
            atualizar(await cancelarPedido(pedido.id));
        } catch (falha) {
            if (naoAutenticado(falha)) navigate("/login");
            else setErro(mensagemDeErro(falha));
        } finally {
            setCancelando(false);
        }
    }

    return (
        <div className="acoesPedido">
            {pendente && !cancelando && <Link to={"/AdressPayment?pedidoId=" + pedido.id}>{t("Continuar pagamento")}</Link>}
            <button type="button" disabled={cancelando} onClick={cancelar}>{t("Cancelar pedido")}</button>
            {erro && <p role="alert">{t(erro)}</p>}
        </div>
    );
}
