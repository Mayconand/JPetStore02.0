package br.com.jpetstore.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "passaro")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Passaro extends Animal{

    private String especie;

    private String plumagem;

    public Passaro (String nome, LocalDate dataNascimento, String descricao, String especie, String plumagem) {
        super(nome, dataNascimento, descricao);
        this.especie = especie;
        this.plumagem = plumagem;
    }
}
