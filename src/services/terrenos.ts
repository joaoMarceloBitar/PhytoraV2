import type {
  TerrenoDetalheOutput,
  TerrenoInput,
  TerrenoOutput,
} from '@/types/api';

import { requisicao } from './api';

export function listarTerrenos(): Promise<TerrenoOutput[]> {
  return requisicao<TerrenoOutput[]>('/terrenos', { autenticado: true });
}

export function buscarTerreno(id: string): Promise<TerrenoDetalheOutput> {
  return requisicao<TerrenoDetalheOutput>(`/terrenos/${id}`, { autenticado: true });
}

export function criarTerreno(dados: TerrenoInput): Promise<TerrenoDetalheOutput> {
  return requisicao<TerrenoDetalheOutput>('/terrenos', {
    method: 'POST',
    body: dados,
    autenticado: true,
  });
}

export function atualizarTerreno(id: string, dados: TerrenoInput): Promise<TerrenoDetalheOutput> {
  return requisicao<TerrenoDetalheOutput>(`/terrenos/${id}`, {
    method: 'PUT',
    body: dados,
    autenticado: true,
  });
}

/** Na API isso arquiva: os diagnósticos feitos no terreno continuam no mapa. */
export function excluirTerreno(id: string): Promise<void> {
  return requisicao<void>(`/terrenos/${id}`, { method: 'DELETE', autenticado: true });
}
