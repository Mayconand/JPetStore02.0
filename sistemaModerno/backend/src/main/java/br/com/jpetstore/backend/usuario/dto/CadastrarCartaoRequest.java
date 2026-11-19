package br.com.jpetstore.backend.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Cartão de demonstração. O banco guarda somente os quatro últimos dígitos. */
public record CadastrarCartaoRequest(
        @NotBlank @Pattern(regexp = "[0-9 -]{13,37}", message = "Informe um número de cartão válido") String numero,
        @NotBlank @Size(max = 150) String nomeTitular,
        @NotBlank @Pattern(regexp = "(0[1-9]|1[0-2])/[0-9]{2}", message = "Use MM/AA") String dataValidade,
        @NotBlank @Size(max = 50) String bandeira) {

    @Override
    public String toString() {
        return "CadastrarCartaoRequest[numero=***]";
    }
}
