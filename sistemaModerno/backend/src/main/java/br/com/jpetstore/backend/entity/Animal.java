package br.com.jpetstore.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    private String nome;


    private LocalDate dataNascimento;

    private String descricao;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(AccessLevel.NONE)
    private List<ImagemAnimal> imagens = new ArrayList<>();

    protected Animal(String nome, LocalDate dataNascimento, String descricao) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.descricao = descricao;
    }

    public void adicionarImagem(ImagemAnimal imagemAnimal) {
        imagemAnimal.setAnimal(this);
        this.imagens.add(imagemAnimal);

    }

    public void removerImagem(ImagemAnimal imagemAnimal) {
        imagemAnimal.setAnimal(null);
        this.imagens.remove(imagemAnimal);
    }
}
