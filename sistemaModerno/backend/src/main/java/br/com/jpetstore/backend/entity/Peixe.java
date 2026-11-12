package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.TipoDeAgua;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "peixe")
@DiscriminatorValue("PEIXE")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Peixe extends Animal {

    @Enumerated(EnumType.STRING)
    private TipoDeAgua tipoDeAgua;

    private String estirpe;

    private Double ph;

    public Peixe(String nome, LocalDate dataNascimento, String descricao, Raca raca, BigDecimal preco, TipoDeAgua tipoDeAgua, String estirpe, Double ph) {
        super(nome, dataNascimento, descricao, raca, preco);
        this.tipoDeAgua = tipoDeAgua;
        this.estirpe = estirpe;
        this.ph = ph;
    }


}
