package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.GrupoEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "reptil")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reptil extends Animal {

    @Enumerated(EnumType.STRING)
    private GrupoEnum grupo;

    private String especie;

    private String mutacao;

    public Reptil (String nome, LocalDate dataNascimento, String descricao,GrupoEnum grupo, String especie, String mutacao) {
        super(nome, dataNascimento, descricao);
        this.grupo = grupo;
        this.especie = especie;
        this.mutacao = mutacao;
    }
}
