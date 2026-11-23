import { useEffect, useState } from "react";
import { listarRacasDoCatalogo } from "../services/animais";

/** Raças da espécie escolhida, vindas do banco (inclui as cadastradas pelo administrador). */
export function useRacasDoCatalogo(especie: string | null): string[] {
    const [resultado, setResultado] = useState<{ especie: string; racas: string[] }>({ especie: "", racas: [] });

    useEffect(() => {
        if (!especie) return;
        let ativo = true;
        listarRacasDoCatalogo(especie)
            .then((racas) => ativo && setResultado({ especie, racas }))
            .catch(() => ativo && setResultado({ especie, racas: [] })); // a lista de animais mostra o erro
        return () => { ativo = false; };
    }, [especie]);

    return resultado.especie === especie ? resultado.racas : [];
}
