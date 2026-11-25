import { t } from "../../services/idioma";
import "./CadastroCachorro.css";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCadastroAnimal, useSugestoesDeTags } from "../../hooks/useCadastroAnimal";
import { juntarOpcoes } from "../../services/listas";

function CadastroGato() {
  const navigate = useNavigate();
  const form = useCadastroAnimal({
    especie: "GATO",
    camposDaEspecie: ["pelagem", "altura", "peso"],
    laudoMaximoMb: 10,
  });

  // Campos principais
  const nome = form.campo("nome");
  const setNome = form.mudar("nome");
  const raca = form.campo("raca");
  const setRaca = form.mudar("raca");
  const pelagem = form.campo("pelagem");
  const setPelagem = form.mudar("pelagem");
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

  // Dropdowns customizados (Raça e Pelagem)
  const [abertoRaca, setAbertoRaca] = useState(false);
  const [abertoPelagem, setAbertoPelagem] = useState(false);
  const racasDisponiveis = form.racas;
  const [adicionandoRaca, setAdicionandoRaca] = useState(false);
  const [novaRacaInput, setNovaRacaInput] = useState("");

  const pelagensDisponiveis = juntarOpcoes([
    "Pelo Longo",
    "Pelo Curto",
    "Encaracolado",
    "Sem Pelo",
  ], form.valoresUsados);

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
    "Brincalhão",
    "Calmo",
    "Independente",
    "Vacinado",
    "Castrado",
    "Sociável",
  ];

  const handleImagemPrincipalChange = form.escolherPrincipal;
  const handleLaudoChange = form.escolherLaudo;
  const handleFotoExtraChange = form.escolherFoto;

  const handleAdicionarRaca = async () => {
    const limpa = novaRacaInput.trim();
    if (!limpa || !(await form.adicionarRaca(limpa))) return;
    setNovaRacaInput("");
    setAdicionandoRaca(false);
    setAbertoRaca(false);
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
    alert(`Gato "${nome || "Sem nome"}" salvo com sucesso!`);
    navigate("/DashboardAdm");
  };

  const tagsFiltradas = useSugestoesDeTags(buscaTag, tagsSugeridas);

  return (
    <div className="cad-page">
      <div className="cad-wrapper">
        <div className="cad-top-bar">
          <h1 className="cad-title">{t("Cadastro gato")}</h1>
          <Link to="/DashboardAdm" className="cad-back-link">
            {t("← Voltar ao painel")}
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
                  alt={t("Preview principal")}
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
                    {t("Insira a imagem")}
                    <br />
                    {t("principal")}
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
              <div className="cad-field">
                <label>{t("Nome:")}</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              {/* Linha Raça e Pelagem */}
              <div className="cad-two-cols">
                {/* Seletor de Raça */}
                <div className="cad-dropdown-container">
                  <button
                    type="button"
                    className={`cad-select-btn ${raca ? "has-value" : ""}`}
                    onClick={() => {
                      setAbertoRaca(!abertoRaca);
                      setAbertoPelagem(false);
                    }}
                  >
                    <span>{raca || t("Raça")}</span>
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

                  {abertoRaca && (
                    <div className="cad-dropdown-menu">
                      {racasDisponiveis.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="cad-dropdown-item"
                          onClick={() => {
                            setRaca(item);
                            setAbertoRaca(false);
                          }}
                        >
                          {item}
                        </button>
                      ))}

                      {adicionandoRaca ? (
                        <div className="cad-new-breed-box">
                          <input
                            type="text"
                            placeholder={t("Nome da raça...")}
                            value={novaRacaInput}
                            onChange={(e) => setNovaRacaInput(e.target.value)}
                            autoFocus
                          />
                          <button type="button" onClick={handleAdicionarRaca}>
                            OK
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="cad-add-breed-btn"
                          onClick={() => setAdicionandoRaca(true)}
                        >
                          {t("+ Adicionar nova raça")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Seletor de Pelagem */}
                <div className="cad-dropdown-container">
                  <button
                    type="button"
                    className={`cad-select-btn ${pelagem ? "has-value" : ""}`}
                    onClick={() => {
                      setAbertoPelagem(!abertoPelagem);
                      setAbertoRaca(false);
                    }}
                  >
                    <span>{pelagem || t("Pelagem")}</span>
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

                  {abertoPelagem && (
                    <div className="cad-dropdown-menu">
                      {pelagensDisponiveis.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="cad-dropdown-item"
                          onClick={() => {
                            setPelagem(item);
                            setAbertoPelagem(false);
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Linha Altura e Peso */}
              <div className="cad-two-cols">
                <div className="cad-field">
                  <label>{t("Altura:")}</label>
                  <input
                    type="text"
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                  />
                </div>

                <div className="cad-field">
                  <label>{t("Peso:")}</label>
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
              <label>{t("Nascimento:")}</label>
              <input
                type="text"
                placeholder="00 / 00 / 0000"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
              />
            </div>

            <div className="cad-field cad-field-laudo">
              <label>{t("Laudos (em PDF ate 10MB):")}</label>
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
            <label>{t("Preço:")}</label>
            <input
              type="text"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="cad-field cad-desc-field">
            <label>{t("Descrição:")}</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          {/* Fotos (3 caixas) */}
          <div className="cad-field">
            <label>{t("Fotos:")}</label>
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
            <label className="cad-tags-title">{t("TAGs:")}</label>
            <span className="cad-tags-subtitle">
              {t("Selecione ate 5 tags do pet")}
            </span>

            <div className="cad-tag-search">
              <input
                type="text"
                placeholder={t("Pesquise uma tag")}
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
                  title={t("Clique para remover")}
                  onClick={() => alternarTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Salvar */}
          <button type="submit" className="cad-submit-btn">
            {t("Salvar")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CadastroGato;