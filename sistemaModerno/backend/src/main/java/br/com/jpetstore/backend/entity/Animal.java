package br.com.jpetstore.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    private String nome;

    /* VER COM YASMIM
    private String raca;
    */

    private LocalDate dataNascimento;

    private String descricao;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(AccessLevel.NONE)
    private List<ImagemAnimal> imagens = new ArrayList<>();

    public void adicionarImagem(ImagemAnimal imagemAnimal) {
        imagemAnimal.setAnimal(this);
        this.imagens.add(imagemAnimal);

    }

    public void removerImagem(ImagemAnimal imagemAnimal) {
        imagemAnimal.setAnimal(null);
        this.imagens.remove(imagemAnimal);
    }
}
