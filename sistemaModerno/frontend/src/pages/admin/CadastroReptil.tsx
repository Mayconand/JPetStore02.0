import "./CadastroCachorro.css";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCadastroAnimal, useSugestoesDeTags } from "../../hooks/useCadastroAnimal";
import { juntarOpcoes } from "../../services/listas";
import { GRUPOS } from "../../services/rotulosAnimal";

function CadastroReptil() {
  const navigate = useNavigate();
  const form = useCadastroAnimal({
    especie: "REPTIL",
    camposDaEspecie: ["grupo", "mutacao", "altura", "peso"],
    rotulos: { grupo: GRUPOS },
    laudoMaximoMb: 10,
  });

  // Campos principais
  const nome = form.campo("nome");
  const setNome = form.mudar("nome");
  const especie = form.campo("raca");
  const setEspecie = form.mudar("raca");
  const grupo = form.campo("grupo");
  const setGrupo = form.mudar("grupo");
  const mutacao = form.campo("mutacao");
  const setMutacao = form.mudar("mutacao");
  const altura = form.campo("altura");
  const setAltura = form.mudar("altura");
  const peso = form.campo("peso");
  const setPeso = form.mudar("peso");
  const nascimento = form.campo("nascimento");
  const setNascimento = form.mudar("nascimento");
  const preco = form.campo("preco");
  const setPreco = form.mudar("preco");
  const descricao = form.campo("descricao");
  const setDescricao = form.mudar("descricao");

  // Controle dos dropdowns (Espécie, Grupo e Mutação)
  const [abertoDropdown, setAbertoDropdown] = useState<
    "especie" | "grupo" | "mutacao" | null
  >(null);

  const especiesDisponiveis = form.racas;
  const [adicionandoEspecie, setAdicionandoEspecie] = useState(false);
  const [novaEspecieInput, setNovaEspecieInput] = useState("");

  const gruposDisponiveis = [
    "Lagartos",
    "Serpentes",
    "Quelônios (Jabutis / Tartarugas)",
    "Crocodilianos",
  ];

  const [mutacoesDaTela, setMutacoesDisponiveis] = useState<string[]>([
    "Normal / Wild",
    "Albino",
    "Hypo",
    "Snow",
    "Tangerine",
  ]);
  const mutacoesDisponiveis = juntarOpcoes(mutacoesDaTela, form.valoresUsados);
  const [adicionandoMutacao, setAdicionandoMutacao] = useState(false);
  const [novaMutacaoInput, setNovaMutacaoInput] = useState("");

  // Uploads (Imagem principal, Laudo PDF e 3 Fotos)
  const imagemPrincipal = form.imagemPrincipal;
  const nomeLaudo = form.nomeLaudo;
  const fotosExtras = form.nomesDasFotos;

  const inputPrincipalRef = useRef<HTMLInputElement | null>(null);
  const inputLaudoRef = useRef<HTMLInputElement | null>(null);
  const inputFotosRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // TAGs (até 5)
  const [buscaTag, setBuscaTag] = useState("");
  const tagsSelecionadas = form.tags;
  const setTagsSelecionadas = form.setTags;
  const tagsSugeridas = [
    "Atletico",
    "Dócil",
    "Calmo",
    "Diurno",
    "Noturno",
    "Arborícola",
    "Terrestre",
    "Microchipado",
  ];

  const handleImagemPrincipalChange = form.escolherPrincipal;
  const handleLaudoChange = form.escolherLaudo;
  const handleFotoExtraChange = form.escolherFoto;

  const handleAdicionarEspecie = async () => {
    const limpa = novaEspecieInput.trim();
    if (!limpa || !(await form.adicionarRaca(limpa))) return;
    setNovaEspecieInput("");
    setAdicionandoEspecie(false);
    setAbertoDropdown(null);
  };

  const handleAdicionarMutacao = () => {
    const limpa = novaMutacaoInput.trim();
    if (!limpa) return;
    if (!mutacoesDisponiveis.includes(limpa)) {
      setMutacoesDisponiveis([...mutacoesDisponiveis, limpa]);
    }
    setMutacao(limpa);
    setNovaMutacaoInput("");
    setAdicionandoMutacao(false);
    setAbertoDropdown(null);
  };

  const alternarTag = (tag: string) => {
    if (tagsSelecionadas.includes(tag)) {
      setTagsSelecionadas(tagsSelecionadas.filter((t) => t !== tag));
    } else if (tagsSelecionadas.length < 5) {
      setTagsSelecionadas([...tagsSelecionadas, tag]);
    }
  };

  const handleAdicionarTagDigitada = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const limpa = buscaTag.trim();
      if (
        limpa &&
        !tagsSelecionadas.includes(limpa) &&
        tagsSelecionadas.length < 5
      ) {
        setTagsSelecionadas([...tagsSelecionadas, limpa]);
        setBuscaTag("");
      }
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await form.salvar())) return;
    alert(`Réptil "${nome || "Sem nome"}" salvo com sucesso!`);
    navigate("/DashboardAdm");
  };

  const tagsFiltradas = useSugestoesDeTags(buscaTag, tagsSugeridas);

  return (
    <div className="cad-page">
      <div className="cad-wrapper">
        <div className="cad-top-bar">
          <h1 className="cad-title">Cadastro reptil</h1>
          <Link to="/DashboardAdm" className="cad-back-link">
            ← Voltar ao painel
          </Link>
        </div>

        <form className="cad-card" onSubmit={handleSalvar}>
          {/* Bloco Superior: Foto Principal à esquerda + Campos à direita */}
          <div className="cad-top-grid">
            {/* Caixa de Upload Principal */}
            <div
              className="cad-main-upload"
              onClick={() => inputPrincipalRef.current?.click()}
            >
              {imagemPrincipal ? (
                <img
                  src={imagemPrincipal}
                  alt="Preview principal"
                  className="cad-main-preview"
                />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 16V4M12 4L7 9M12 4L17 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 15V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>
                    Insira a imagem
                    <br />
                    principal
                  </span>
                </>
              )}
              <input
                ref={inputPrincipalRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImagemPrincipalChange}
              />
            </div>

            {/* Campos da Direita */}
            <div className="cad-right-fields">
              {/* Linha 1: Nome + Espécie */}
              <div className="cad-two-cols" style={{ alignItems: "end" }}>
                <div className="cad-field">
                  <label>Nome:</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>

                {/* Seletor de Espécie */}
                <div className="cad-dropdown-container">
                  <button
                    type="button"
                    className={`cad-select-btn ${especie ? "has-value" : ""}`}
                    onClick={() =>
                      setAbertoDropdown(
                        abertoDropdown === "especie" ? null : "especie"
                      )
                    }
                  >
                    <span>{especie || "Espécie"}</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {abertoDropdown === "especie" && (
                    <div className="cad-dropdown-menu">
                      {especiesDisponiveis.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="cad-dropdown-item"
                          onClick={() => {
                            setEspecie(item);
                            setAbertoDropdown(null);
                          }}
                        >
                          {item}
                        </button>
                      ))}

                      {adicionandoEspecie ? (
                        <div className="cad-new-breed-box">
                          <input
                            type="text"
                            placeholder="Nome da espécie..."
                            value={novaEspecieInput}
                            onChange={(e) =>
                              setNovaEspecieInput(e.target.value)
                            }
                            autoFocus
                          />
                          <button type="button" onClick={handleAdicionarEspecie}>
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cad-add-breed-btn"
                          onClick={() => setAdicionandoEspecie(true)}
                        >
                          + Adicionar nova espécie
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 2: Grupo + Mutação */}
              <div className="cad-two-cols">
                {/* Seletor de Grupo */}
                <div className="cad-dropdown-container">
                  <button
                    type="button"
                    className={`cad-select-btn ${grupo ? "has-value" : ""}`}
                    onClick={() =>
                      setAbertoDropdown(
                        abertoDropdown === "grupo" ? null : "grupo"
                      )
                    }
                  >
                    <span>{grupo || "Grupo"}</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {abertoDropdown === "grupo" && (
                    <div className="cad-dropdown-menu">
                      {gruposDisponiveis.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="cad-dropdown-item"
                          onClick={() => {
                            setGrupo(item);
                            setAbertoDropdown(null);
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seletor de Mutação */}
                <div className="cad-dropdown-container">
                  <button
                    type="button"
                    className={`cad-select-btn ${mutacao ? "has-value" : ""}`}
                    onClick={() =>
                      setAbertoDropdown(
                        abertoDropdown === "mutacao" ? null : "mutacao"
                      )
                    }
                  >
                    <span>{mutacao || "Mutação"}</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {abertoDropdown === "mutacao" && (
                    <div className="cad-dropdown-menu">
                      {mutacoesDisponiveis.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="cad-dropdown-item"
                          onClick={() => {
                            setMutacao(item);
                            setAbertoDropdown(null);
                          }}
                        >
                          {item}
                        </button>
                      ))}

                      {adicionandoMutacao ? (
                        <div className="cad-new-breed-box">
                          <input
                            type="text"
                            placeholder="Nome da mutação..."
                            value={novaMutacaoInput}
                            onChange={(e) =>
                              setNovaMutacaoInput(e.target.value)
                            }
                            autoFocus
                          />
                          <button type="button" onClick={handleAdicionarMutacao}>
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cad-add-breed-btn"
                          onClick={() => setAdicionandoMutacao(true)}
                        >
                          + Adicionar nova mutação
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 3: Altura + Peso */}
              <div className="cad-two-cols">
                <div className="cad-field">
                  <label>Altura:</label>
                  <input
                    type="text"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                  />
                </div>

                <div className="cad-field">
                  <label>Peso:</label>
                  <input
                    type="text"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Linha Nascimento e Laudos */}
          <div className="cad-mid-row">
            <div className="cad-field cad-field-nasc">
              <label>Nascimento:</label>
              <input
                type="text"
                placeholder="00 / 00 / 0000"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
              />
            </div>

            <div className="cad-field cad-field-laudo">
              <label>Laudos (em PDF ate 10MB):</label>
              <button
                type="button"
                className="cad-file-box"
                onClick={() => inputLaudoRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 15V4M12 4L8 8M12 4L16 8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 15V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{nomeLaudo || "Insira o documento aqui"}</span>
              </button>
              <input
                ref={inputLaudoRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleLaudoChange}
              />
            </div>
          </div>

          {/* Preço: obrigatório na API */}
          <div className="cad-field">
            <label>Preço:</label>
            <input
              type="text"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="cad-field cad-desc-field">
            <label>Descrição:</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Fotos (3 caixas) */}
          <div className="cad-field">
            <label>Fotos:</label>
            <div className="cad-fotos-grid">
              {[0, 1, 2].map((idx) => (
                <div key={idx}>
                  <button
                    type="button"
                    className="cad-file-box"
                    onClick={() => inputFotosRefs[idx].current?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 15V4M12 4L8 8M12 4L16 8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 15V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>
                      {fotosExtras[idx] || `Insira a imagem ${idx + 1} aqui`}
                    </span>
                  </button>
                  <input
                    ref={inputFotosRefs[idx]}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFotoExtraChange(idx, e)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* TAGs */}
          <div className="cad-tags-section">
            <label className="cad-tags-title">TAGs:</label>
            <span className="cad-tags-subtitle">
              Selecione ate 5 tags do pet
            </span>

            <div className="cad-tag-search">
              <input
                type="text"
                placeholder="Pesquise uma tag"
                value={buscaTag}
                onChange={(e) => setBuscaTag(e.target.value)}
                onKeyDown={handleAdicionarTagDigitada}
              />
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
            </div>

            {/* Sugestões ao digitar */}
            {buscaTag.trim() !== "" && (
              <div className="cad-tag-suggestions">
                {tagsFiltradas.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="cad-tag-chip suggestion"
                    onClick={() => {
                      alternarTag(tag);
                      setBuscaTag("");
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}

            {/* TAGs selecionadas */}
            <div className="cad-selected-tags">
              {tagsSelecionadas.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="cad-tag-chip active"
                  title="Clique para remover"
                  onClick={() => alternarTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Salvar */}
          <button type="submit" className="cad-submit-btn">
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}

export default CadastroReptil;