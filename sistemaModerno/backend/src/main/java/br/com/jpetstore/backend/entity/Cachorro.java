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
@Table(name = "cachorro")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cachorro extends Animal {


    private String raca;

    @Enumerated(EnumType.STRING)
    private PorteEnum porte;

    public Cachorro(String nome, LocalDate dataNascimento,String descricao, String raca, PorteEnum porte) {
        super(nome,dataNascimento,descricao);
        this.raca = raca;
        this.porte = porte;
    }

}
