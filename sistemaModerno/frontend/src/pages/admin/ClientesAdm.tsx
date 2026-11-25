import { t, idiomaAtual, moedaLocal } from "../../services/idioma";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarClientes, type ClienteAdmin } from "../../services/lojaAdmin";
import { mensagemDeErro } from "../../services/api";
import "./DashboardAdm.css";

export default function ClientesAdm() {
    const [clientes, setClientes] = useState<ClienteAdmin[] | null>(null);
    const [busca, setBusca] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarClientes().then(lista => { if (ativo) setClientes(lista); })
            .catch(falha => { if (ativo) setErro(mensagemDeErro(falha)); });
        return () => { ativo = false; };
    }, []);

    const normalizar = (valor: string) => valor.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    const filtrados = clientes?.filter(cliente =>
        normalizar(`${cliente.nome} ${cliente.sobrenome} ${cliente.email}`).includes(normalizar(busca.trim())));

    return <main className="adm-fluxo adm-status-section">
        <Link to="/DashboardAdm">{t("Voltar ao painel")}</Link>
        <h1>{t("Clientes")}</h1>
        <label>{t("Buscar por nome ou e-mail") + " "}<input type="search" value={busca} onChange={e => setBusca(e.target.value)} /></label>
        {erro && <p role="alert">{t(erro)}</p>}
        {!clientes && !erro && <p role="status">{t("Carregando clientes...")}</p>}
        {filtrados?.length === 0 && <p>{t("Nenhum cliente encontrado.")}</p>}
        {!!filtrados?.length && <div className="status-table-wrapper">
            <table>
                <thead><tr><th>{t("Nome")}</th><th>{t("E-mail")}</th><th>{t("Telefone")}</th><th>{t("Pedidos")}</th><th>{t("Valor total")}</th><th>{t("Último pedido")}</th></tr></thead>
                <tbody>{filtrados.map(cliente => <tr key={cliente.id}>
                    <td>{cliente.nome} {cliente.sobrenome}</td><td>{cliente.email}</td><td>{cliente.telefone || "—"}</td>
                    <td>{cliente.quantidadePedidos}</td>
                    <td>{moedaLocal(cliente.valorTotalGasto)}</td>
                    <td>{new Date(cliente.ultimoPedido).toLocaleDateString(idiomaAtual())}</td>
                </tr>)}</tbody>
            </table>
        </div>}
    </main>;
}
