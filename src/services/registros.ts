import { File } from 'expo-file-system';

import type { OrigemFoto, RegistroOutput } from '@/types/api';

import { requisicao } from './api';

export type NovoRegistro = {
  /** Foto já preparada (ver utils/foto.ts). */
  uri: string;
  id_cultura_plantada: string;
  origem_foto: OrigemFoto;
  /** GPS no momento da foto. Ausente: a API usa o ponto do terreno. */
  gps?: { latitude: number; longitude: number; precisao: number | null };
};

/** Envia a foto: a API roda o diagnóstico, guarda a foto e devolve o registro. */
export function enviarRegistro(dados: NovoRegistro): Promise<RegistroOutput> {
  const form = new FormData();
  form.append('id_cultura_plantada', dados.id_cultura_plantada);
  form.append('origem_foto', dados.origem_foto);
  if (dados.gps) {
    form.append('latitude', String(dados.gps.latitude));
    form.append('longitude', String(dados.gps.longitude));
    if (dados.gps.precisao != null) form.append('precisao', String(dados.gps.precisao));
  }
  form.append('image', new File(dados.uri));

  return requisicao<RegistroOutput>('/registros', {
    method: 'POST',
    body: form,
    autenticado: true,
  });
}

export function buscarRegistro(id: string): Promise<RegistroOutput> {
  return requisicao<RegistroOutput>(`/registros/${id}`, { autenticado: true });
}

/** Diagnósticos do terreno, os mais recentes primeiro. */
export function listarRegistrosDoTerreno(idTerreno: string): Promise<RegistroOutput[]> {
  return requisicao<RegistroOutput[]>(`/terrenos/${idTerreno}/registros`, { autenticado: true });
}
