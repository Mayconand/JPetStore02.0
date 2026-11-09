package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.PorteEnum;
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
@Table(name = "gato")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Gato extends Animal {

    @Enumerated(EnumType.STRING)
    private PorteEnum porte;

    private String pelagem;

    public Gato(String nome, LocalDate dataNascimento, String descricao,PorteEnum porte,String pelagem) {
        super(nome,dataNascimento,descricao);
        this.porte = porte;
        this.pelagem = pelagem;
    }

}
