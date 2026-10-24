import { fonteDemonstracao } from './demonstracao';
import type { Area, Filtros, RegistroPublico, ResumoMunicipio } from './tipos';

/**
 * De onde o mapa tira os registros. A tela só conhece esta interface: trocar
 * os dados de demonstração pela API (etapa 6) é escrever outra implementação,
 * sem mexer em nenhum componente.
 *
 * Contrato previsto da API: GET /registros?bbox=&dias=&doenca=&saudaveis=
 * e um resumo por município para o panorama.
 */
export interface FonteRegistros {
  /** Verdadeiro quando os dados são fictícios: a tela avisa o usuário. */
  readonly demonstracao: boolean;
  buscarRegistros(area: Area, filtros: Filtros): Promise<RegistroPublico[]>;
  resumirPorMunicipio(area: Area, filtros: Filtros): Promise<ResumoMunicipio[]>;
}

/** Fora do desenvolvimento, sem a API da etapa 6 o mapa fica vazio. */
const fonteVazia: FonteRegistros = {
  demonstracao: false,
  buscarRegistros: async () => [],
  resumirPorMunicipio: async () => [],
};

export const fonteRegistros: FonteRegistros = __DEV__ ? fonteDemonstracao : fonteVazia;
