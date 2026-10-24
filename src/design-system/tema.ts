import { alvoToque, espaco, paleta, raio, sombra, tipografia } from './tokens';

/** Par de cores para fundo e texto de um selo ou faixa. */
export type ParDeCores = { fundo: string; texto: string };

/** Cores de uma categoria no mapa: o marcador e um fundo suave para listas. */
export type CorDeCategoria = { cor: string; suave: string };

/** Chaves das doenças, iguais à `chave_modelo` da API. */
export type ChaveDoenca = 'ferrugem' | 'mancha_alvo' | 'mosaico' | 'septoria';

export type Tema = {
  nome: string;
  cores: {
    fundo: string;
    superficie: string;
    superficieSuave: string;
    borda: string;
    texto: string;
    textoSecundario: string;
    textoSobrePrimaria: string;
    primaria: string;
    primariaSuave: string;
    destaque: string;
    erro: string;
    sobreposicao: string;
  };
  /** Cor de cada doença no mapa. Letras e nomes ficam no domínio, não no tema. */
  doenca: Record<ChaveDoenca, CorDeCategoria> & { saudavel: CorDeCategoria };
  /** Selos de nível de risco e de proximidade. */
  risco: {
    alto: ParDeCores;
    moderado: ParDeCores;
    baixo: ParDeCores;
    indisponivel: ParDeCores;
  };
  /** Tons de selo genéricos. */
  tom: {
    neutro: ParDeCores;
    sucesso: ParDeCores;
    aviso: ParDeCores;
    perigo: ParDeCores;
    info: ParDeCores;
  };
  mapa: {
    terreno: string;
    raio: string;
    raioFundo: string;
    linha: string;
    grupo: string;
  };
  abas: {
    fundo: string;
    ativo: string;
    inativo: string;
  };
  espaco: typeof espaco;
  raio: typeof raio;
  tipografia: typeof tipografia;
  sombra: typeof sombra;
  alvoToque: number;
};

/** Tema atual do app: superfícies claras sobre a marca verde. */
export const temaPadrao: Tema = {
  nome: 'padrao',
  cores: {
    fundo: paleta.branco,
    superficie: paleta.branco,
    superficieSuave: paleta.verde50,
    borda: paleta.cinza200,
    texto: paleta.verde950,
    textoSecundario: paleta.cinza600,
    textoSobrePrimaria: paleta.branco,
    primaria: paleta.verde800,
    primariaSuave: paleta.verde100,
    destaque: paleta.areia,
    erro: paleta.vermelho,
    sobreposicao: 'rgba(21, 33, 27, 0.82)',
  },
  doenca: {
    ferrugem: { cor: paleta.laranja, suave: paleta.laranjaClaro },
    mancha_alvo: { cor: paleta.roxo, suave: paleta.roxoClaro },
    mosaico: { cor: paleta.azul, suave: paleta.azulClaro },
    septoria: { cor: paleta.marrom, suave: paleta.marromClaro },
    saudavel: { cor: paleta.verdeFolha, suave: paleta.verdeFolhaClaro },
  },
  risco: {
    alto: { fundo: paleta.vermelho, texto: paleta.branco },
    moderado: { fundo: paleta.ambar, texto: paleta.ambarEscuro },
    baixo: { fundo: paleta.verde100, texto: paleta.verde600 },
    indisponivel: { fundo: paleta.cinza100, texto: paleta.cinza700 },
  },
  tom: {
    neutro: { fundo: paleta.cinza100, texto: paleta.cinza700 },
    sucesso: { fundo: paleta.verdeFolhaClaro, texto: paleta.verde600 },
    aviso: { fundo: paleta.ambarClaro, texto: paleta.ambarEscuro },
    perigo: { fundo: paleta.vermelhoClaro, texto: paleta.vermelho },
    info: { fundo: paleta.azulClaro, texto: paleta.azul },
  },
  mapa: {
    terreno: paleta.verde800,
    raio: paleta.verde800,
    raioFundo: 'rgba(44, 71, 62, 0.08)',
    linha: paleta.verde800,
    grupo: paleta.verde800,
  },
  abas: {
    fundo: paleta.verde800,
    ativo: paleta.branco,
    inativo: 'rgba(217, 217, 217, 0.65)',
  },
  espaco,
  raio,
  tipografia,
  sombra,
  alvoToque,
};
