package br.com.jpetstore.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Idiomas suportados pela plataforma (RF11). No JSON e no banco aparecem como "pt-BR", "en" e "es". */
public enum IdiomaEnum {
    PT_BR("pt-BR"),
    EN("en"),
    ES("es");

    private final String codigo;

    IdiomaEnum(String codigo) {
        this.codigo = codigo;
    }

    @JsonValue
    public String getCodigo() {
        return codigo;
    }

    @JsonCreator
    public static IdiomaEnum deCodigo(String codigo) {
        for (IdiomaEnum idioma : values()) {
            if (idioma.codigo.equals(codigo)) {
                return idioma;
            }
        }
        throw new IllegalArgumentException("Idioma deve ser pt-BR, en ou es");
    }
}
