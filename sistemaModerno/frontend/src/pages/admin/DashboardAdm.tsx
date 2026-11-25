import { t } from "../../services/idioma";
import "./DashboardAdm.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import cachorroAdm from "../../assets/imagens/animais/animais-Adm/cachorro-Adm.png";
import gatoAdm from "../../assets/imagens/animais/animais-Adm/gato-Adm.png";
import repteisAdm from "../../assets/imagens/animais/animais-Adm/repteis-Adm.png";
import passarosAdm from "../../assets/imagens/animais/animais-Adm/passaros-Adm.png";
import peixesAdm from "../../assets/imagens/animais/animais-Adm/peixes-Adm.png";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { mensagemDeErro, naoAutenticado, obterSessao } from "../../services/api";
import { alterarStatusPedido, filtrarPedidos } from "../../services/lojaAdmin";
import type { PedidoAdmin } from "../../services/lojaAdmin";
import type { StatusPedido } from "../../services/pedidos";

interface PedidoStatus {
  id: string;
  nome: string;
  horario: string;
  cliente: string;
  status: StatusPedido;
}

/** Status da API -> texto da tela. */
const STATUS: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando",
  PAGO: "Preparação",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

function statusDoFiltro(texto: string): StatusPedido | undefined {
  return (Object.keys(STATUS) as StatusPedido[]).find((status) => STATUS[status] === texto);
}

function paraLinha(pedido: PedidoAdmin): PedidoStatus {
  const data = new Date(pedido.dataCriacao);
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return {
    id: pedido.id,
    nome: pedido.animais ?? "",
    horario: `${data.toLocaleDateString("pt-BR")} as ${hora}`,
    cliente: pedido.cliente,
    status: pedido.status,
  };
}

function DashboardAdm() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);

  const [pedidos, setPedidos] = useState<PedidoStatus[]>([]);
  const [todos, setTodos] = useState<PedidoAdmin[]>([]);

  const [revisao, setRevisao] = useState(0);
  const [alterando, setAlterando] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function avancarPedido(pedido: PedidoStatus) {
    const proximo = pedido.status === "PAGO" ? "ENVIADO" : "ENTREGUE";
    setAlterando(pedido.id);
    setErro("");
    try {
      await alterarStatusPedido(pedido.id, proximo);
    } catch (falha) {
      if (naoAutenticado(falha)) navigate("/login");
      else setErro(mensagemDeErro(falha));
    } finally {
      setRevisao(atual => atual + 1);
      setAlterando(null);
    }
  }

  // Totais dos cards: não dependem do filtro.
  useEffect(() => {
    let ativo = true;
    filtrarPedidos()
      .then((lista) => ativo && setTodos(lista))
      .catch(() => {}); // a tabela, abaixo, mostra o erro
    return () => {
      ativo = false;
    };
  }, [revisao]);

  // RF30 — o filtro de status é aplicado pela API.
  useEffect(() => {
    let ativo = true;
    filtrarPedidos(statusDoFiltro(filtroStatus))
      .then((lista) => ativo && setPedidos(lista.map(paraLinha)))
      .catch((e) => {
        if (!ativo) return;
        if (naoAutenticado(e)) navigate("/login");
        else alert(mensagemDeErro(e));
      });
    return () => {
      ativo = false;
    };
  }, [filtroStatus, navigate, revisao]);

  // Os cards contam os pedidos do status sobre os que não foram cancelados.
  const ativos = todos.filter((pedido) => pedido.status !== "CANCELADO").length;
  const contar = (status: StatusPedido) => todos.filter((pedido) => pedido.status === status).length;
  const porcentagem = (status: StatusPedido) => `${ativos ? (contar(status) / ativos) * 100 : 0}%`;

  const categorias = [
    { id: "cachorro", nome: "CACHORRO", classe: "cat-cachorro", imagem: cachorroAdm },
    { id: "gatos", nome: "GATOS", classe: "cat-gatos", imagem: gatoAdm },
    { id: "repteis", nome: "REPTEIS", classe: "cat-repteis", imagem: repteisAdm },
    { id: "passaros", nome: "PASSAROS", classe: "cat-passaros", imagem: passarosAdm },
    { id: "peixes", nome: "PEIXES", classe: "cat-peixes", imagem: peixesAdm },
  ];

  const opcoesCadastro = [
    { nome: "Cachorros", rota: "/adm/adicionar", cor: "#e8e6f7" },
    { nome: "Gatos", rota: "/adm/adicionar-gato", cor: "#f7e3d4" },
    { nome: "Répteis", rota: "/adm/adicionar-reptil", cor: "#dff2d8" },
    { nome: "Pássaros", rota: "/adm/adicionar-passaro", cor: "#d9eef7" },
    { nome: "Peixes", rota: "/adm/adicionar-peixe", cor: "#d9e7f7" },
  ];

  const pedidosFiltrados = pedidos.filter((item) => {
    const bateTexto =
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.cliente.toLowerCase().includes(busca.toLowerCase());
    return bateTexto;
  });

  const getStatusClass = (status: PedidoStatus["status"]) => {
    if (status === "ENVIADO") return "badge-enviado";
    if (status === "ENTREGUE") return "badge-entrega";
    return "badge-preparacao";
  };

  return (
    <div className="adm-container">
      {/* Cabeçalho Superior */}
      <header className="adm-header">
        <Link to="/DashboardAdm">
          <img src={logo} alt="Logo JPetStore Demo" className="adm-logo" />
        </Link>

        <div className="adm-header-right">
          <button
            type="button"
            className="adm-bell-btn"
            aria-label={t("Notificações")}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="adm-user-box">
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>
              <strong>{t("Nome:")}</strong> {obterSessao()?.usuario.nome}
            </span>
          </div>
        </div>
      </header>

      <main className="adm-main">
        {/* Barra de Busca à esquerda + 3 Botões à direita */}
        <section className="adm-toolbar">
          <div className="adm-search-box">
            <input
              type="text"
              placeholder={t("Buscar")}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label={t("Buscar pedidos ou clientes")}
            />
            <button type="button" aria-label={t("Pesquisar")}>
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16 16L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="adm-action-buttons">
            <Link to="/adm/cupons" className="btn-adm btn-clientes">{t("Criar cupom")}</Link>
            <Link to="/adm/clientes" className="btn-adm btn-clientes">
              <svg viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M5 20C5 16.5 8 14.5 12 14.5C16 14.5 19 16.5 19 20"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              {t("Ver clientes")}
            </Link>

            <div className="filter-wrapper">
              <button
                type="button"
                className="btn-adm btn-filtrar"
                onClick={() => setMostrarFiltro(!mostrarFiltro)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 5H21L14 13.5V19L10 21V13.5L3 5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {filtroStatus === "Todos" ? t("Filtrar") : t(filtroStatus)}
              </button>

              {mostrarFiltro && (
                <div className="filter-dropdown">
                  {["Todos", ...Object.values(STATUS)].map((st) => (
                    <button
                      key={t(st)}
                      type="button"
                      className={filtroStatus === st ? "active" : ""}
                      onClick={() => {
                        setFiltroStatus(st);
                        setMostrarFiltro(false);
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-adm btn-adicionar"
              onClick={() => setModalAdicionarAberto(true)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {t("Adicionar")}
            </button>
          </div>
        </section>

        {/* Cards de Categorias (imagens exportadas direto do Figma) */}
        <section className="adm-categories">
          {categorias.map((cat) => (
            <Link
              to={`/adm/categoria/${cat.id}`}
              key={cat.id}
              className="category-card"
            >
              <img src={cat.imagem} alt={t(cat.nome)} />
            </Link>
          ))}
        </section>

        <hr className="adm-divider" />

        {/* Seção Pedidos */}
        <section className="adm-pedidos-section">
          <h2>{t("Pedidos")}</h2>

          <div className="adm-pedidos-grid">
            {/* Card Em preparação */}
            <div className="pedido-card card-preparacao">
              <div className="pedido-card-top">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t("Em preparação")}</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>{contar("PAGO")}</strong>
                  <span>/ {ativos}</span>
                </div>
                <span className="pedido-sublabel">{t("Em preparação")}</span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: porcentagem("PAGO") }} />
              </div>
            </div>

            {/* Card Enviados */}
            <div className="pedido-card card-enviados">
              <div className="pedido-card-top">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M1 3H15V16H1V3ZM15 8H19L22 11V16H15V8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="5.5" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="18.5" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span>{t("Enviados")}</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>{contar("ENVIADO")}</strong>
                  <span>/ {ativos}</span>
                </div>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: porcentagem("ENVIADO") }} />
              </div>
            </div>

            {/* Card Entregues */}
            <div className="pedido-card card-entregues">
              <div className="pedido-card-top">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 10L12 3L21 10V20H15V14H9V20H3V10Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t("Entregues")}</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>{contar("ENTREGUE")}</strong>
                  <span>/ {ativos}</span>
                </div>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: porcentagem("ENTREGUE") }} />
              </div>
            </div>
          </div>
        </section>

        {/* Tabela Status de entregas */}
        <section className="adm-status-section">
          <h2>{t("Status de entregas")}</h2>
          {erro && <p role="alert">{t(erro)}</p>}

          <div className="status-table-wrapper">
            <div className="status-table-header">
              <span>{t("Nome")}</span>
              <span>{t("Horario do pedido")}</span>
              <span>{t("Cliente")}</span>
              <span>{t("Status")}</span>
            </div>

            {pedidosFiltrados.length > 0 ? (
              pedidosFiltrados.map((pedido) => (
                <div className="status-table-row" key={pedido.id}>
                  <span className="col-nome">{pedido.nome}</span>
                  <span className="col-horario">{pedido.horario}</span>
                  <span className="col-cliente">{pedido.cliente}</span>
                  <div className="col-status">
                    <span className={`status-badge ${getStatusClass(pedido.status)}`}>
                      {t(STATUS[pedido.status])}
                    </span>
                    {(pedido.status === "PAGO" || pedido.status === "ENVIADO") && (
                      <button type="button" disabled={alterando !== null} onClick={() => avancarPedido(pedido)}>
                        {pedido.status === "PAGO" ? t("Marcar como enviado") : t("Marcar como entregue")}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="status-empty">{t("Nenhum pedido encontrado.")}</p>
            )}
          </div>
        </section>
      </main>

     {modalAdicionarAberto && (
        <div
          onClick={() => setModalAdicionarAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "420px",
              backgroundColor: "#fff9f5",
              border: "2px solid #f3d7c6",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", color: "#5b4338" }}>
                {t("O que você gostaria de adicionar?")}
              </h2>
              <button
                type="button"
                onClick={() => setModalAdicionarAberto(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#5b4338",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {opcoesCadastro.map((opcao) => (
                <button
                  key={opcao.nome}
                  type="button"
                  onClick={() => {
                    setModalAdicionarAberto(false);
                    navigate(opcao.rota);
                  }}
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: opcao.cor,
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#4f3b32",
                    cursor: "pointer",
                  }}
                >
                  {t(opcao.nome)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdm;