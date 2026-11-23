package br.com.jpetstore.backend.arquivo;

/** Foto ou laudo em PDF, já validado. */
public record Arquivo(String nome, String tipoConteudo, byte[] conteudo) {

    /** Nome sem a extensão (usado como título do laudo). */
    public String nomeSemExtensao() {
        int ponto = nome.lastIndexOf('.');
        return ponto > 0 ? nome.substring(0, ponto) : nome;
    }
}
