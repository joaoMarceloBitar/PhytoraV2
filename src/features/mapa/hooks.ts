import { useEffect, useRef, useState } from 'react';

import type { TerrenoOutput } from '@/types/api';

import { DIAS_ALERTA, RAIO_ALERTA_KM } from './constantes';
import { fonteRegistros } from './fonte';
import { areaAoRedor, proximidadeDoTerreno, type ProximidadeDoTerreno } from './geografia';
import type { Area, Filtros, RegistroPublico, ResumoMunicipio } from './tipos';

type Dados =
  | { modo: 'pontos'; registros: RegistroPublico[] }
  | { modo: 'panorama'; resumos: ResumoMunicipio[] };

/**
 * Registros da área visível (ou o resumo por município, com o mapa afastado).
 * Os dados anteriores ficam na tela enquanto a nova busca não volta, para os
 * marcadores não piscarem; respostas que chegam fora de ordem são descartadas.
 */
export function useRegistrosDaArea(area: Area | null, filtros: Filtros, panorama: boolean) {
  // Nulo até a primeira resposta chegar.
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);
  const busca = useRef(0);

  useEffect(() => {
    if (!area) return;
    const minha = ++busca.current;
    setCarregando(true);

    const pedido = panorama
      ? fonteRegistros.resumirPorMunicipio(area, filtros).then((resumos): Dados => ({ modo: 'panorama', resumos }))
      : fonteRegistros.buscarRegistros(area, filtros).then((registros): Dados => ({ modo: 'pontos', registros }));

    pedido
      .then((novos) => {
        if (minha !== busca.current) return;
        setDados(novos);
        setErro(false);
      })
      .catch(() => {
        if (minha === busca.current) setErro(true);
      })
      .finally(() => {
        if (minha === busca.current) setCarregando(false);
      });
  }, [area, filtros, panorama]);

  return { dados, carregando, erro, demonstracao: fonteRegistros.demonstracao };
}

/**
 * Doenças perto de cada terreno do usuário (15 km, 7 dias), independente da
 * área que está na tela. Ordenado pelo terreno com mais registros por perto.
 */
export function useProximidade(terrenos: TerrenoOutput[]): ProximidadeDoTerreno[] {
  const [resultado, setResultado] = useState<ProximidadeDoTerreno[]>([]);
  // Recalcula só quando os terrenos ou as culturas deles mudam.
  const chave = terrenos
    .map((t) => `${t.id_terreno}:${t.culturas_ativas.map((c) => c.id_cultura_plantada).join('+')}`)
    .join('|');

  useEffect(() => {
    let ativo = true;
    const filtros: Filtros = { dias: DIAS_ALERTA as 7, doenca: 'todas', saudaveis: false };
    Promise.all(
      terrenos.map(async (terreno) => {
        const registros = await fonteRegistros.buscarRegistros(
          areaAoRedor(terreno.localizacao, RAIO_ALERTA_KM),
          filtros,
        );
        return proximidadeDoTerreno(terreno, registros);
      }),
    )
      .then((lista) => {
        if (!ativo) return;
        setResultado(
          lista.filter((p): p is ProximidadeDoTerreno => p !== null).sort((a, b) => b.total - a.total),
        );
      })
      .catch(() => {
        if (ativo) setResultado([]);
      });
    return () => {
      ativo = false;
    };
    // `chave` resume `terrenos`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return resultado;
}
