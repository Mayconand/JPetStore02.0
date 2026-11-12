package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.PorteEnum;
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
@Table(name = "cachorro")
@DiscriminatorValue("CACHORRO")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cachorro extends Animal {

    @Enumerated(EnumType.STRING)
    private PorteEnum porte;

    public Cachorro(String nome, LocalDate dataNascimento, String descricao, Raca raca, BigDecimal preco, PorteEnum porte) {
        super(nome, dataNascimento, descricao, raca, preco);
        this.porte = porte;
    }

}
