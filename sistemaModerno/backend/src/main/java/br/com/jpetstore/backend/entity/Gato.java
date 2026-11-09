package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.PorteEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "gato")
public class Gato extends Animal {

    @Enumerated(EnumType.STRING)
    private PorteEnum porte;

    private String pelagem;
}
