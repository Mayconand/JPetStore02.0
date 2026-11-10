package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.EspecieEnum;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "raca")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Raca {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EspecieEnum especie;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    public Raca(EspecieEnum especie, String nome, String descricao) {
        this.especie = especie;
        this.nome = nome;
        this.descricao = descricao;
    }
}
