package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/** Regra única para senhas novas: obrigatória e com pelo menos 8 caracteres. */
@NotBlank
@Size(min = 8)
@ReportAsSingleViolation
@Constraint(validatedBy = {})
@Target({FIELD, METHOD, PARAMETER})
@Retention(RUNTIME)
public @interface Senha {

    String message() default "A senha deve ter pelo menos 8 caracteres";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
