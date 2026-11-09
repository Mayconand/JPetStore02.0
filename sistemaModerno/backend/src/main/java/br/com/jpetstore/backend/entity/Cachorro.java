package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.PorteEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cachorro")
@Getter
@Setter
public class Cachorro extends Animal {


    private String raca;

    @Enumerated(EnumType.STRING)
    private PorteEnum porte;
}
