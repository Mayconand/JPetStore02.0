package br.com.jpetstore.backend;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;

/**
 * Banco dos testes de integração: um PostgreSQL local (sem Docker), configurado
 * por TEST_DB_URL / TEST_DB_USER / TEST_DB_PASSWORD (ver backend/.env.example).
 * Antes de entregar a conexão, recria o schema jpetstore com as migrations do
 * Supabase, então o banco da equipe na nuvem nunca é tocado pelos testes.
 */
@TestConfiguration(proxyBeanMethods = false)
public class BancoDeTesteConfig {

    @Bean
    DataSource dataSource(@Value("${app.test.db.url}") String url,
                          @Value("${app.test.db.user}") String usuario,
                          @Value("${app.test.db.password}") String senha) {
        MigracoesDeTeste.prepararUmaVez(url, usuario, senha);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setUsername(usuario);
        dataSource.setPassword(senha);
        dataSource.setMaximumPoolSize(5);
        return dataSource;
    }
}
