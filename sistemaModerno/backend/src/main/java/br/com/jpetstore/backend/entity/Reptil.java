package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.GrupoEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "reptil")
public class Reptil extends Animal {

    @Enumerated(EnumType.STRING)
    private GrupoEnum grupo;

    private String especie;

    private String mutacao;
}
