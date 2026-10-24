import type { Region } from 'react-native-maps';

import type { ChaveDoenca } from '@/design-system';
import type { Localizacao, TerrenoOutput } from '@/types/api';
import { distanciaKm } from '@/utils/geo';

import { DIAS_ALERTA, RAIO_ALERTA_KM } from './constantes';
import type { Area, GrupoAproximado, RegistroPublico } from './tipos';

const KM_POR_GRAU = 111.32;
const DIA_MS = 86_400_000;

/** Área visível do mapa, com uma margem para não buscar de novo a cada arrasto curto. */
export function areaDaRegiao(regiao: Region, margem = 0.15): Area {
  const meiaLat = (regiao.latitudeDelta / 2) * (1 + margem);
  const meiaLng = (regiao.longitudeDelta / 2) * (1 + margem);
  return {
    norte: regiao.latitude + meiaLat,
    sul: regiao.latitude - meiaLat,
    leste: regiao.longitude + meiaLng,
    oeste: regiao.longitude - meiaLng,
  };
}

/** Quadrado que contém o círculo de `km` em volta do ponto. */
export function areaAoRedor(ponto: Localizacao, km: number): Area {
  const dLat = km / KM_POR_GRAU;
  const dLng = km / (KM_POR_GRAU * Math.cos((ponto.latitude * Math.PI) / 180));
  return {
    norte: ponto.latitude + dLat,
    sul: ponto.latitude - dLat,
    leste: ponto.longitude + dLng,
    oeste: ponto.longitude - dLng,
  };
}

/** Separa os registros com ponto exato dos anônimos, que viram um marcador por município e doença. */
export function separarPorPrecisao(registros: RegistroPublico[]): {
  exatos: RegistroPublico[];
  grupos: GrupoAproximado[];
} {
  const exatos: RegistroPublico[] = [];
  const grupos = new Map<string, GrupoAproximado>();
  for (const r of registros) {
    if (r.precisao === 'exato' || !r.municipio) {
      exatos.push(r);
      continue;
    }
    const chave = `${r.municipio.codigo_ibge}:${r.doenca?.chave ?? 'saudavel'}`;
    const grupo = grupos.get(chave);
    if (grupo) grupo.registros.push(r);
    else grupos.set(chave, { chave, municipio: r.municipio, doenca: r.doenca, centro: r.localizacao, registros: [r] });
  }
  return { exatos, grupos: [...grupos.values()] };
}

/** O terreno do usuário mais perto de um ponto, com a distância. */
export function terrenoMaisProximo(
  ponto: Localizacao,
  terrenos: TerrenoOutput[],
): { terreno: TerrenoOutput; km: number } | null {
  let melhor: { terreno: TerrenoOutput; km: number } | null = null;
  for (const terreno of terrenos) {
    const km = distanciaKm(ponto, terreno.localizacao);
    if (!melhor || km < melhor.km) melhor = { terreno, km };
  }
  return melhor;
}

export type ProximidadeDoTerreno = {
  terreno: TerrenoOutput;
  /** Doenças a até 15 km nos últimos 7 dias, a mais frequente primeiro. */
  porDoenca: { chave: ChaveDoenca; nome: string; total: number; maisPertoKm: number }[];
  total: number;
};

/**
 * Doenças perto de um terreno na janela da regra de alerta. Por enquanto só
 * proximidade e frequência: o clima entra no cálculo na etapa 8. As doenças
 * do modelo são de soja, então só terrenos com soja ativa são avaliados.
 */
export function proximidadeDoTerreno(
  terreno: TerrenoOutput,
  registros: RegistroPublico[],
  agora = Date.now(),
): ProximidadeDoTerreno | null {
  if (!terreno.culturas_ativas.some((c) => c.cultura.nome === 'soja')) return null;

  const desde = agora - DIAS_ALERTA * DIA_MS;
  const porDoenca = new Map<ChaveDoenca, ProximidadeDoTerreno['porDoenca'][number]>();
  for (const r of registros) {
    if (!r.doenca || Date.parse(r.data_registro) < desde) continue;
    const km = distanciaKm(terreno.localizacao, r.localizacao);
    if (km > RAIO_ALERTA_KM) continue;
    const atual = porDoenca.get(r.doenca.chave);
    if (atual) {
      atual.total++;
      atual.maisPertoKm = Math.min(atual.maisPertoKm, km);
    } else {
      porDoenca.set(r.doenca.chave, { chave: r.doenca.chave, nome: r.doenca.nome, total: 1, maisPertoKm: km });
    }
  }

  const lista = [...porDoenca.values()].sort((a, b) => b.total - a.total || a.maisPertoKm - b.maisPertoKm);
  return { terreno, porDoenca: lista, total: lista.reduce((s, d) => s + d.total, 0) };
}
