package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.TipoDeAgua;
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
@Getter
@Setter
@Table(name = "peixe")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Peixe extends Animal{

    @Enumerated(EnumType.STRING)
    private TipoDeAgua  tipoDeAgua;

    private String especie;

    private String estirpe;

    private Double ph;

    public Peixe (String nome, LocalDate dataNascimento, String descricao,TipoDeAgua tipoDeAgua, String especie, String estirpe, Double ph) {
        super(nome, dataNascimento, descricao);
        this.tipoDeAgua = tipoDeAgua;
        this.especie = especie;
        this.estirpe = estirpe;
        this.ph = ph;
    }


}
