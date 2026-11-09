package br.com.jpetstore.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "passaro")
public class Passaro extends Animal{

    private String especie;

    private String plumagem;
}
