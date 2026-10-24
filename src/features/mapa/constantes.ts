import type { ChaveDoenca } from '@/design-system';
import type { Localizacao } from '@/types/api';

import type { Periodo } from './tipos';

/** Raio e janela da regra de alerta (iguais aos da API, etapa 6). */
export const RAIO_ALERTA_KM = 15;
export const DIAS_ALERTA = 7;

/**
 * Acima deste zoom (graus de latitude na tela) o mapa troca os pontos pelo
 * panorama por município. Muitos marcadores pesam no Android e viram ruído.
 */
export const LIMIAR_PANORAMA = 0.45;

/** Mesmo com o zoom perto, acima disto o mapa também vai para o panorama. */
export const LIMITE_DE_PONTOS = 300;

/** Raio do círculo tracejado dos registros anônimos, em metros. */
export const RAIO_APROXIMADO_M = 3500;

export const PERIODOS: readonly { valor: Periodo; rotulo: string }[] = [
  { valor: 7, rotulo: '7 dias' },
  { valor: 14, rotulo: '14 dias' },
  { valor: 30, rotulo: '30 dias' },
];

/** Nome e letra de cada doença. A letra repete a cor para quem não distingue cores. */
export const DOENCAS: readonly { chave: ChaveDoenca; nome: string; curto: string; letra: string }[] = [
  { chave: 'ferrugem', nome: 'Ferrugem asiática', curto: 'Ferrugem', letra: 'F' },
  { chave: 'mancha_alvo', nome: 'Mancha-alvo', curto: 'Mancha-alvo', letra: 'A' },
  { chave: 'mosaico', nome: 'Mosaico', curto: 'Mosaico', letra: 'M' },
  { chave: 'septoria', nome: 'Septoria', curto: 'Septoria', letra: 'S' },
];

export const NOME_SAUDAVEL = 'Folha saudável';

export function letraDaDoenca(chave: ChaveDoenca): string {
  return DOENCAS.find((d) => d.chave === chave)?.letra ?? '?';
}

/** Onde o mapa abre quando o usuário ainda não tem terreno. */
export const CENTRO_PADRAO: Localizacao = { latitude: -29.6842, longitude: -53.8069 };
export const ZOOM_INICIAL = 0.3;
