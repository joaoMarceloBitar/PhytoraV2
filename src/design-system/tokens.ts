// Valores brutos do design system. Nenhuma tela usa estes nomes direto: elas
// leem o tema (tema.ts), que dá a cada valor um papel ("superfície", "texto
// secundário"). Trocar o visual do app é trocar o tema, não as telas.

export const paleta = {
  verde950: '#15211B',
  verde900: '#1F3329',
  verde800: '#2C473E',
  verde700: '#365A4E',
  verde600: '#1D6A50',
  verde200: '#CFE8DA',
  verde100: '#DCEFE5',
  verde50: '#F3F6F4',

  cinza700: '#33443A',
  cinza600: '#586A60',
  cinza400: '#97A59B',
  cinza300: '#C9D1CA',
  cinza200: '#E3E9E4',
  cinza100: '#EEF1EF',

  branco: '#FFFFFF',
  areia: '#F4EDDE',

  laranja: '#D9661F',
  laranjaEscuro: '#A8460F',
  laranjaClaro: '#FBEBDD',
  roxo: '#5B3A93',
  roxoClaro: '#EEE8F6',
  azul: '#1F7A9C',
  azulClaro: '#E3EEF4',
  marrom: '#6E4A1E',
  marromClaro: '#F1E8DD',
  verdeFolha: '#5E7A69',
  verdeFolhaClaro: '#E5EFE8',

  vermelho: '#B0301F',
  vermelhoClaro: '#FDF1EE',
  ambar: '#F2D39B',
  ambarEscuro: '#5A3E08',
  ambarClaro: '#FBF4E6',
  salmao: '#FFB4A8',

  terraMapa: '#E7ECE3',
} as const;

export const espaco = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const raio = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pilula: 999,
} as const;

export const tipografia = {
  // undefined = fonte do sistema (Roboto no Android): nenhuma fonte a carregar.
  familia: {
    titulo: undefined as string | undefined,
    corpo: undefined as string | undefined,
  },
  tamanho: {
    legenda: 12,
    rotulo: 13,
    corpo: 15,
    destaque: 16,
    subtitulo: 18,
    titulo: 22,
    display: 28,
  },
  peso: {
    regular: '400',
    medio: '500',
    negrito: '700',
  },
  // Multiplicador da altura de linha sobre o tamanho da fonte.
  entrelinha: 1.4,
} as const;

/** Sombras no formato do React Native: `elevation` no Android, `shadow*` no iOS. */
export const sombra = {
  nenhuma: {},
  baixa: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  media: {
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  alta: {
    elevation: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -2 },
  },
} as const;

/** Menor área de toque aceitável (diretriz de acessibilidade). */
export const alvoToque = 44;
