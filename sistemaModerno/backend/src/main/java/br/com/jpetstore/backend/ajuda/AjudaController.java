package br.com.jpetstore.backend.ajuda;

import br.com.jpetstore.backend.ajuda.dto.TopicoAjuda;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ajuda")
public class AjudaController {

    private final AjudaService service;

    public AjudaController(AjudaService service) {
        this.service = service;
    }


    @GetMapping
    public List<TopicoAjuda> listar(@RequestParam(required = false) String termo) {
        return service.listar(termo);
    }
}
