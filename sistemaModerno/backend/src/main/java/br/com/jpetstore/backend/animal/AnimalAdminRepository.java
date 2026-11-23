package br.com.jpetstore.backend.animal;

import br.com.jpetstore.backend.animal.dto.AnimalAdminResponse;
import br.com.jpetstore.backend.animal.dto.AnimalAdminResumo;
import br.com.jpetstore.backend.comum.FuncoesBanco;
import br.com.jpetstore.backend.enums.EspecieEnum;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Repository
public class AnimalAdminRepository {

    /** Uma página da listagem e o total de animais encontrados. */
    public record ResultadoListagem(long total, List<AnimalAdminResumo> animais) {
    }

    /** Inclui os indisponíveis. O atributo é porte, pelagem, plumagem, tipo de água ou grupo. */
    private static final String LISTAGEM = """
            (with filtro as (
                select nullif(jpetstore.fn_normalizar(btrim(?)), '') as termo,
                       nullif(upper(jpetstore.fn_normalizar(btrim(?))), '') as especie,
                       ?::uuid as raca_id,
                       ?::boolean as disponivel,
                       nullif(jpetstore.fn_normalizar(btrim(?)), '') as atributo
            ),
            filtrados as (
                select a.id, a.nome, a.especie, a.raca_id, r.nome as raca, a.data_nascimento, a.preco, a.disponivel
                  from jpetstore.animal a
                  join jpetstore.raca r on r.id = a.raca_id
                  left join jpetstore.cachorro c on c.id = a.id
                  left join jpetstore.gato g on g.id = a.id
                  left join jpetstore.passaro pa on pa.id = a.id
                  left join jpetstore.peixe pe on pe.id = a.id
                  left join jpetstore.reptil re on re.id = a.id
                 cross join filtro f
                 where (f.especie is null or a.especie = f.especie)
                   and (f.raca_id is null or a.raca_id = f.raca_id)
                   and (f.disponivel is null or a.disponivel = f.disponivel)
                   and (f.atributo is null
                        or jpetstore.fn_normalizar(coalesce(c.porte, g.pelagem, pa.plumagem, pe.tipo_de_agua, re.grupo)) = f.atributo)
                   and (f.termo is null
                        or position(f.termo in jpetstore.fn_normalizar(a.nome)) > 0
                        or position(f.termo in jpetstore.fn_normalizar(r.nome)) > 0)
            ),
            pagina as (
                select * from filtrados order by nome, id limit ? offset ?
            )
            select json_build_object(
                'total', (select count(*) from filtrados),
                'animais', coalesce((
                    select json_agg(json_build_object(
                               'id', p.id, 'nome', p.nome, 'especie', p.especie, 'racaId', p.raca_id, 'raca', p.raca,
                               'dataNascimento', p.data_nascimento, 'preco', p.preco, 'disponivel', p.disponivel,
                               'atributos', jpetstore.fn_obter_animal(p.id) -> 'atributos',
                               'quantidadeLaudos', (select count(*) from jpetstore.laudo l where l.animal_id = p.id))
                           order by p.nome, p.id)
                      from pagina p), '[]'::json)))
            """;

    /** Ficha pública mais a galeria com os ids, a principal primeiro. */
    private static final String FICHA = """
            (select jpetstore.fn_obter_animal(a.id)::jsonb || jsonb_build_object(
                'galeria', coalesce((
                    select jsonb_agg(jsonb_build_object('id', i.id, 'url', i.imagem_url, 'principal', i.principal)
                                     order by i.principal desc, i.ordem, i.imagem_url)
                      from jpetstore.imagem_animal i where i.animal_id = a.id), '[]'::jsonb))
               from (select ?::uuid as id) a)
            """;

    /** Campo de texto livre de cada espécie (tabela.coluna fixas: não vêm do usuário). */
    private static final Map<EspecieEnum, String> TEXTO_LIVRE = Map.of(
            EspecieEnum.GATO, "select pelagem as valor from jpetstore.gato",
            EspecieEnum.PASSARO, "select plumagem as valor from jpetstore.passaro",
            EspecieEnum.PEIXE, "select estirpe as valor from jpetstore.peixe",
            EspecieEnum.REPTIL, "select mutacao as valor from jpetstore.reptil");

    private final FuncoesBanco banco;

    public AnimalAdminRepository(FuncoesBanco banco) {
        this.banco = banco;
    }

    public ResultadoListagem listar(String termo, String especie, UUID racaId, Boolean disponivel,
                                    String atributo, int limite, int offset) {
        return banco.json(LISTAGEM, ResultadoListagem.class, termo, especie, racaId, disponivel, atributo, limite, offset);
    }

    public AnimalAdminResponse obter(UUID id) {
        return banco.json(FICHA, AnimalAdminResponse.class, id);
    }

    /** Valores já usados no campo de texto livre da espécie: pelagem, plumagem, estirpe ou mutação. */
    public List<String> valoresUsados(EspecieEnum especie) {
        String consulta = TEXTO_LIVRE.get(especie);
        if (consulta == null) {
            return List.of();
        }
        return banco.linhas("(" + consulta + ") v where valor is not null group by valor order by valor",
                (rs, linha) -> rs.getString("valor"));
    }

    public UUID cadastrar(EspecieEnum especie, Map<String, Object> dados) {
        return banco.valor("jpetstore.fn_cadastrar_animal(?, ?::jsonb)", UUID.class, especie.name(), banco.paraJson(dados));
    }

    public void editar(UUID id, Map<String, Object> dados) {
        banco.executar("jpetstore.fn_editar_animal(?, ?::jsonb)", id, banco.paraJson(dados));
    }

    public void excluir(UUID id) {
        banco.executar("jpetstore.fn_excluir_animal(?)", id);
    }
}
