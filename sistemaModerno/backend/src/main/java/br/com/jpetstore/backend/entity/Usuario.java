package br.com.jpetstore.backend.entity;

import br.com.jpetstore.backend.enums.PapelEnum;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

/**
 * Usuário da plataforma. Escritas (cadastro, perfil, senha) passam pelas funções
 * de banco; a entidade é usada para leitura (ex.: login).
 * As colunas "preferencias" (jsonb) e de auditoria não são mapeadas aqui.
 */
@Entity
@Table(name = "usuario")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Usuario {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String sobrenome;

    @Column(nullable = false)
    private String email;

    private String telefone;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "jpetstore.papel_usuario")
    private PapelEnum papel;

    @Column(name = "idioma_preferencial", nullable = false)
    private String idiomaPreferencial;
}
