// Espelho manual dos DTOs da PhytoraAPI (src/dtos/ de lá). Mesma convenção:
// snake_case em português, sem tradução para camelCase.

// --- Auth ------------------------------------------------------------------

export interface RegistrarInput {
  nome: string;
  email: string;
  senha: string;
  device_id: string;
  /** Ligado: os diagnósticos aparecem para os outros só pelo município. */
  modo_anonimo: boolean;
}

export interface LoginInput {
  email: string;
  senha: string;
  device_id: string;
}

export interface RefreshInput {
  refresh_token: string;
}

export interface UsuarioOutput {
  id_user: string;
  nome: string;
  email: string;
  modo_anonimo: boolean;
}

export interface AuthOutput {
  access_token: string;
  refresh_token: string;
  usuario: UsuarioOutput;
}

export interface RefreshOutput {
  access_token: string;
  refresh_token: string;
}

// --- Terrenos e culturas ---------------------------------------------------

/** Ponto do GPS. Mesmo formato do `expo-location` e do `react-native-maps`. */
export interface Localizacao {
  latitude: number;
  longitude: number;
}

/** Calculado pela API a partir da localização; nulo fora de qualquer município. */
export interface MunicipioOutput {
  codigo_ibge: string;
  nome: string;
  uf: string;
}

export interface CulturaOutput {
  id_cultura: string;
  nome: string;
}

/** Datas em `AAAA-MM-DD`. */
export interface CulturaPlantadaOutput {
  id_cultura_plantada: string;
  id_terreno: string;
  cultura: CulturaOutput;
  data_plantio: string;
  safra: string;
  /** Nulo enquanto a cultura está ativa. */
  encerrada_em: string | null;
}

export interface TerrenoOutput {
  id_terreno: string;
  nome: string;
  area_hectares: number | null;
  localizacao: Localizacao;
  municipio: MunicipioOutput | null;
  criado_em: string;
  culturas_ativas: CulturaPlantadaOutput[];
}

export interface TerrenoDetalheOutput extends TerrenoOutput {
  culturas_encerradas: CulturaPlantadaOutput[];
}

/** Serve para criar e para editar (o PUT recebe o objeto completo). */
export interface TerrenoInput {
  nome: string;
  area_hectares: number | null;
  localizacao: Localizacao;
}

export interface CulturaPlantadaInput {
  id_cultura: string;
  data_plantio: string;
  safra: string;
}

export interface EditarCulturaPlantadaInput {
  data_plantio: string;
  safra: string;
}

// --- Registros de doença ---------------------------------------------------

export type OrigemFoto = 'camera' | 'galeria';

export interface PredicaoOutput {
  classe: string;
  confianca: number;
}

/** Visão do dono do registro: inclui o ponto exato. */
export interface RegistroOutput {
  id_registro: string;
  id_terreno: string;
  id_cultura_plantada: string;
  cultura: CulturaOutput;
  /** Nulo quando a folha foi classificada como saudável. */
  doenca: { id_doenca: string; nome: string } | null;
  classe_modelo: string;
  confianca: number;
  /** Confiança abaixo do limiar da API: fora do mapa público e do risco. */
  inconclusivo: boolean;
  top_predicoes: PredicaoOutput[];
  versao_modelo: string;
  /** Relativa ao endereço da API (ex: /fotos/2026/10/<uuid>.jpg). */
  foto_url: string;
  localizacao: Localizacao;
  precisao_gps_m: number | null;
  origem_localizacao: 'gps' | 'terreno';
  origem_foto: OrigemFoto;
  municipio: MunicipioOutput | null;
  data_registro: string;
}

// --- Erros -----------------------------------------------------------------

/** Formato de toda resposta de erro da API. */
export interface ErroOutput {
  ok: false;
  error: string;
  detalhes?: { campo: string; mensagem: string }[];
}
