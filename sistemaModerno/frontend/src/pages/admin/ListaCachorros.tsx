import "./ListaCategoria.css";
import logo from "../../assets/imagens/logos/logoJPetStore.png";
import cachorroAdm from "../../assets/imagens/animais/animais-Adm/cachorro-Adm.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useListaAnimais } from "../../hooks/useListaAnimais";
import { obterSessao } from "../../services/api";
import { PORTES_DA_LISTA } from "../../services/rotulosAnimal";

function ListaCachorros() {
  const navigate = useNavigate();
  const {
    busca,
    setBusca,
    filtro: filtroPorte,
    setFiltro: setFiltroPorte,
    lista: filtrados,
    aviso,
    excluir,
    verLaudo,
  } = useListaAnimais("CACHORRO", "porte", PORTES_DA_LISTA);
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(false);

  const opcoesFiltro = ["Todos", "Porte Pequeno", "Porte Medio", "Porte Grande"];

  return (
    <div className="lista-cat-page">
      <div className="lista-cat-container">
        <header className="lista-cat-header">
          <Link to="/DashboardAdm">
            <img src={logo} alt="JPetStore Demo" className="lista-cat-logo" />
          </Link>

          <div className="lista-cat-user-area">
            <button type="button" className="lista-cat-bell-btn" title="Notificações">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="lista-cat-user-pill">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span><strong>Nome:</strong> {obterSessao()?.usuario.nome}</span>
            </div>
          </div>
        </header>

        <div className="lista-cat-search-bar">
          <input
            type="text"
            placeholder="Buscar"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="lista-cat-controls-row">
          <img src={cachorroAdm} alt="Cachorro" className="lista-cat-banner-img" />

          <div className="lista-cat-actions">
            <button
              type="button"
              className="lista-cat-btn-add"
              onClick={() => navigate("/adm/adicionar")}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <span>Adicionar</span>
            </button>

            <div className="lista-cat-filter-wrapper">
              <button
                type="button"
                className="lista-cat-btn-filter"
                onClick={() => setMenuFiltroAberto(!menuFiltroAberto)}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 5H21L14 13.5V19L10 21V13.5L3 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
                <span>{filtroPorte === "Todos" ? "Filtrar" : filtroPorte}</span>
              </button>

              {menuFiltroAberto && (
                <div className="lista-cat-filter-menu">
                  {opcoesFiltro.map((op) => (
                    <button
                      key={op}
                      type="button"
                      className={filtroPorte === op ? "active" : ""}
                      onClick={() => {
                        setFiltroPorte(op);
                        setMenuFiltroAberto(false);
                      }}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lista-cat-table-card">
          <table className="lista-cat-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Porte</th>
                <th>Raça</th>
                <th>Nascimento</th>
                <th>Laudos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.atributo}</td>
                    <td>{item.raca}</td>
                    <td>{item.nascimento}</td>
                    <td>
                      <button
                        type="button"
                        className="lista-cat-pdf-btn"
                        onClick={() => void verLaudo(item)}
                      >
                        Ver PDF
                      </button>
                    </td>
                    <td>
                      <div className="lista-cat-row-icons">
                        <button
                          type="button"
                          className="lista-cat-icon-btn edit"
                          title="Editar"
                          onClick={() => navigate(`/adm/categoria/cachorro/${item.id}`)}
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="lista-cat-icon-btn delete"
                          title="Excluir"
                          onClick={() => void excluir(item.id, item.nome)}
                        >
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="lista-cat-empty">{aviso || "Nenhum cachorro encontrado."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ListaCachorros;