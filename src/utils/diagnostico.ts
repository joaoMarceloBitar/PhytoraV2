import type { CulturaPlantadaOutput, TerrenoOutput } from '@/types/api';

/** Única cultura com modelo treinado (ver docs/v2-proposta.md). */
export const CULTURA_COM_DIAGNOSTICO = 'soja';

/** Parâmetros da rota /diagnostico/foto. Todos texto, como toda rota. */
export type ParamsDiagnostico = {
  id_cultura_plantada: string;
  id_terreno: string;
  terreno_nome: string;
  /** Ponto do terreno: para avisar quando a foto está longe dele. */
  terreno_latitude: string;
  terreno_longitude: string;
};

export function paramsDoDiagnostico(
  terreno: Pick<TerrenoOutput, 'id_terreno' | 'nome' | 'localizacao'>,
  cultura: CulturaPlantadaOutput,
): ParamsDiagnostico {
  return {
    id_cultura_plantada: cultura.id_cultura_plantada,
    id_terreno: terreno.id_terreno,
    terreno_nome: terreno.nome,
    terreno_latitude: String(terreno.localizacao.latitude),
    terreno_longitude: String(terreno.localizacao.longitude),
  };
}
