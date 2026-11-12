package br.com.jpetstore.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/** Sobe o contexto completo e valida (ddl-auto=validate) as entidades contra as migrations. */
@SpringBootTest
@ActiveProfiles("test")
@Import(BancoDeTesteConfig.class)
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
