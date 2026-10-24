import type { ChaveDoenca } from '@/design-system';
import type { Localizacao, MunicipioOutput } from '@/types/api';

/** Retângulo visível do mapa, em graus. */
export type Area = { norte: number; sul: number; leste: number; oeste: number };

export type Periodo = 7 | 14 | 30;

export type Filtros = {
  dias: Periodo;
  /** Uma doença ou todas. */
  doenca: ChaveDoenca | 'todas';
  saudaveis: boolean;
};

/**
 * Registro como os outros usuários veem: sem autor, sem terreno e, se a conta
 * de quem registrou está em modo anônimo, só com o município.
 */
export type RegistroPublico = {
  id_registro: string;
  /** Nulo = folha saudável. */
  doenca: { chave: ChaveDoenca; nome: string } | null;
  cultura: string;
  data_registro: string;
  confianca: number;
  /** Relativa ao endereço da API; nula nos dados de demonstração. */
  foto_url: string | null;
  /** `municipio`: conta anônima; `localizacao` é o centro do município. */
  precisao: 'exato' | 'municipio';
  localizacao: Localizacao;
  municipio: MunicipioOutput | null;
};

/** Contagem de um município, para o panorama com o mapa afastado. */
export type ResumoMunicipio = {
  municipio: MunicipioOutput;
  centro: Localizacao;
  total: number;
};

/**
 * Registros anônimos da mesma doença no mesmo município. Todos ficam no
 * centro do município, então viram um marcador só, com a contagem.
 */
export type GrupoAproximado = {
  chave: string;
  municipio: MunicipioOutput;
  doenca: RegistroPublico['doenca'];
  centro: Localizacao;
  registros: RegistroPublico[];
};
