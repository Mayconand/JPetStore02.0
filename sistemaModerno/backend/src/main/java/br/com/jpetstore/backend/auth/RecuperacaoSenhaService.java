package br.com.jpetstore.backend.auth;

import br.com.jpetstore.backend.comum.ApiException;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.usuario.Credenciais;
import br.com.jpetstore.backend.usuario.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RecuperacaoSenhaService {
    private static final Logger LOG = LoggerFactory.getLogger(RecuperacaoSenhaService.class);
    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final UsuarioRepository usuarios;
    private final FuncoesBanco banco;
    private final PasswordEncoder senhas;
    private final ObjectProvider<JavaMailSender> envio;
    private final String host;
    private final String remetente;
    private final String origem;

    public RecuperacaoSenhaService(UsuarioRepository usuarios, FuncoesBanco banco, PasswordEncoder senhas,
                                   ObjectProvider<JavaMailSender> envio,
                                   @Value("${spring.mail.host}") String host,
                                   @Value("${app.recuperacao.remetente}") String remetente,
                                   @Value("${app.recuperacao.url-loja}") String origem) {
        this.usuarios = usuarios;
        this.banco = banco;
        this.senhas = senhas;
        this.envio = envio;
        this.host = host;
        this.remetente = remetente;
        this.origem = origem.replaceFirst("/+$", "");
    }

    public void solicitar(String email) {
        JavaMailSender mail = envio.getIfAvailable();
        if (mail == null || host.isBlank() || remetente.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "RECUPERACAO_INDISPONIVEL",
                    "A recuperação por e-mail está temporariamente indisponível.");
        }
        usuarios.buscarCredenciaisPorEmail(email.trim()).ifPresent(usuario -> enviarLink(usuario, mail));
    }

    private void enviarLink(Credenciais usuario, JavaMailSender mail) {
        byte[] bytes = new byte[32];
        ALEATORIO.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String hash = hash(token);
        int registrados = banco.alterar("""
                insert into jpetstore.recuperacao_senha (usuario_id, token_hash, senha_anterior, email)
                values (?, ?, ?, ?)
                on conflict (usuario_id) do update set token_hash = excluded.token_hash,
                    senha_anterior = excluded.senha_anterior, email = excluded.email, criado_em = now()
                where jpetstore.recuperacao_senha.criado_em <= now() - interval '1 minute'
                """, usuario.id(), hash, usuario.senhaHash(), usuario.email());
        if (registrados == 0) return;

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom(remetente);
        mensagem.setTo(usuario.email());
        mensagem.setSubject("Redefinição de senha da JPetStore");
        mensagem.setText("Abra este link para escolher uma nova senha. Ele expira em 30 minutos.\n\n"
                + origem + "/recuperar-senha#token=" + token
                + "\n\nSe você não solicitou a alteração, ignore este e-mail.");
        try {
            mail.send(mensagem);
        } catch (MailException falha) {
            banco.alterar("delete from jpetstore.recuperacao_senha where token_hash = ?", hash);
            LOG.warn("Falha no envio do e-mail de recuperação ({})", falha.getClass().getSimpleName());
        }
    }

    public void redefinir(String token, String novaSenha) {
        if (novaSenha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SENHA_LONGA", "Use uma senha de até 72 bytes.");
        }
        boolean alterada = Boolean.TRUE.equals(banco.valor("jpetstore.fn_redefinir_senha(?, ?)",
                Boolean.class, hash(token), senhas.encode(novaSenha)));
        if (!alterada) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "LINK_INVALIDO", "O link expirou ou já foi usado.");
        }
    }

    private static String hash(String token) {
        try {
            byte[] resumo = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumo);
        } catch (NoSuchAlgorithmException falha) {
            throw new IllegalStateException(falha);
        }
    }
}
