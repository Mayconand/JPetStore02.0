package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.SexoEnum;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Indivíduo único à venda. A espécie é definida pela subclasse e gravada na
 * coluna "especie" (discriminador), que também garante, no banco, que a raça
 * pertence à mesma espécie.
 */
@Entity
@Table(name = "animal")
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "especie", discriminatorType = DiscriminatorType.STRING)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Animal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Setter(AccessLevel.NONE)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    private LocalDate dataNascimento;

    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "raca_id", nullable = false)
    private Raca raca;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(nullable = false)
    private boolean disponivel = true;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(columnDefinition = "jpetstore.sexo_animal")
    private SexoEnum sexo;

    @Column(nullable = false)
    private boolean castrado;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(AccessLevel.NONE)
    private List<ImagemAnimal> imagens = new ArrayList<>();

    protected Animal(String nome, LocalDate dataNascimento, String descricao, Raca raca, BigDecimal preco) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.descricao = descricao;
        this.raca = raca;
        this.preco = preco;
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
