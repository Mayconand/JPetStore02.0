import "./DashboardAdm.css";

import logo from "../../assets/imagens/logos/logoJPetStore.png";
import cachorroAdm from "../../assets/imagens/animais/animais-Adm/cachorro-Adm.png";
import gatoAdm from "../../assets/imagens/animais/animais-Adm/gato-Adm.png";
import repteisAdm from "../../assets/imagens/animais/animais-Adm/repteis-Adm.png";
import passarosAdm from "../../assets/imagens/animais/animais-Adm/passaros-Adm.png";
import peixesAdm from "../../assets/imagens/animais/animais-Adm/peixes-Adm.png";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface PedidoStatus {
  id: number;
  nome: string;
  horario: string;
  cliente: string;
  status: "Preparação" | "Enviado" | "Entrega";
}

function DashboardAdm() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);

  const [pedidos, setPedidos] = useState<PedidoStatus[]>([
    {
      id: 1,
      nome: "Snoopy",
      horario: "00/00/000 as 00:00",
      cliente: "Carlos Gonçales",
      status: "Preparação",
    },
    {
      id: 2,
      nome: "Chico",
      horario: "00/00/000 as 00:00",
      cliente: "Duda Bellico",
      status: "Enviado",
    },
    {
      id: 3,
      nome: "Thor",
      horario: "00/00/000 as 00:00",
      cliente: "Gisele Justus",
      status: "Entrega",
    },
  ]);

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
    const bateStatus =
      filtroStatus === "Todos" || item.status === filtroStatus;
    return bateTexto && bateStatus;
  });

  const alternarStatus = (id: number) => {
    const ordem: PedidoStatus["status"][] = [
      "Preparação",
      "Enviado",
      "Entrega",
    ];
    setPedidos((prev) =>
      prev.map((pedido) => {
        if (pedido.id !== id) return pedido;
        const proximoIndex = (ordem.indexOf(pedido.status) + 1) % ordem.length;
        return { ...pedido, status: ordem[proximoIndex] };
      })
    );
  };

  const getStatusClass = (status: PedidoStatus["status"]) => {
    if (status === "Preparação") return "badge-preparacao";
    if (status === "Enviado") return "badge-enviado";
    return "badge-entrega";
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
            aria-label="Notificações"
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
              <strong>Nome:</strong> Fulano
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
              placeholder="Buscar"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar pedidos ou clientes"
            />
            <button type="button" aria-label="Pesquisar">
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
              Ver clientes
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
                {filtroStatus === "Todos" ? "Filtrar" : filtroStatus}
              </button>

              {mostrarFiltro && (
                <div className="filter-dropdown">
                  {["Todos", "Preparação", "Enviado", "Entrega"].map((st) => (
                    <button
                      key={st}
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
              Adicionar
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
              <img src={cat.imagem} alt={cat.nome} />
            </Link>
          ))}
        </section>

        <hr className="adm-divider" />

        {/* Seção Pedidos */}
        <section className="adm-pedidos-section">
          <h2>Pedidos</h2>

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
                <span>Em preparação</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>2</strong>
                  <span>/ 5</span>
                </div>
                <span className="pedido-sublabel">Em preparação</span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: "40%" }} />
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
                <span>Enviados</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>1</strong>
                  <span>/ 2</span>
                </div>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: "50%" }} />
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
                <span>Entregues</span>
              </div>

              <div className="pedido-card-middle">
                <div className="pedido-numero">
                  <strong>1</strong>
                  <span>/ 2</span>
                </div>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: "50%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* Tabela Status de entregas */}
        <section className="adm-status-section">
          <h2>Status de entregas</h2>

          <div className="status-table-wrapper">
            <div className="status-table-header">
              <span>Nome</span>
              <span>Horario do pedido</span>
              <span>Cliente</span>
              <span>Status</span>
            </div>

            {pedidosFiltrados.length > 0 ? (
              pedidosFiltrados.map((pedido) => (
                <div className="status-table-row" key={pedido.id}>
                  <span className="col-nome">{pedido.nome}</span>
                  <span className="col-horario">{pedido.horario}</span>
                  <span className="col-cliente">{pedido.cliente}</span>
                  <div className="col-status">
                    <button
                      type="button"
                      title="Clique para alterar o status"
                      className={`status-badge ${getStatusClass(pedido.status)}`}
                      onClick={() => alternarStatus(pedido.id)}
                    >
                      {pedido.status}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="status-empty">Nenhum pedido encontrado.</p>
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
                O que você gostaria de adicionar?
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
                  {opcao.nome}
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