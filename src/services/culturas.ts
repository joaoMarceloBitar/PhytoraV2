import type {
  CulturaOutput,
  CulturaPlantadaInput,
  CulturaPlantadaOutput,
  EditarCulturaPlantadaInput,
} from '@/types/api';

import { requisicao } from './api';

/** Catálogo fixo (público na API). */
export function listarCulturas(): Promise<CulturaOutput[]> {
  return requisicao<CulturaOutput[]>('/culturas');
}

export function adicionarCultura(
  idTerreno: string,
  dados: CulturaPlantadaInput,
): Promise<CulturaPlantadaOutput> {
  return requisicao<CulturaPlantadaOutput>(`/terrenos/${idTerreno}/culturas-plantadas`, {
    method: 'POST',
    body: dados,
    autenticado: true,
  });
}

export function editarCultura(
  id: string,
  dados: EditarCulturaPlantadaInput,
): Promise<CulturaPlantadaOutput> {
  return requisicao<CulturaPlantadaOutput>(`/culturas-plantadas/${id}`, {
    method: 'PUT',
    body: dados,
    autenticado: true,
  });
}

/** Encerrada não reabre. `encerradaEm` em `AAAA-MM-DD`. */
export function encerrarCultura(id: string, encerradaEm: string): Promise<CulturaPlantadaOutput> {
  return requisicao<CulturaPlantadaOutput>(`/culturas-plantadas/${id}/encerrar`, {
    method: 'POST',
    body: { encerrada_em: encerradaEm },
    autenticado: true,
  });
}
