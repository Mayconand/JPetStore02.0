package br.com.jpetstore.backend.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "passaro")
@DiscriminatorValue("PASSARO")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Passaro extends Animal {

    private String plumagem;

    public Passaro(String nome, LocalDate dataNascimento, String descricao, Raca raca, BigDecimal preco, String plumagem) {
        super(nome, dataNascimento, descricao, raca, preco);
        this.plumagem = plumagem;
    }
}
