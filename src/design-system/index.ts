// Ponto único de entrada do design system. Telas importam daqui.
export { TemaProvider, useTema, criarEstilos } from './TemaProvider';
export { temaPadrao } from './tema';
export type { Tema, ChaveDoenca, CorDeCategoria, ParDeCores } from './tema';

export { default as Texto } from './componentes/Texto';
export type { VarianteTexto } from './componentes/Texto';
export { default as Botao } from './componentes/Botao';
export { default as Chip } from './componentes/Chip';
export { default as Cartao } from './componentes/Cartao';
export { default as Selo } from './componentes/Selo';
export type { TomSelo } from './componentes/Selo';
export { default as Segmentado } from './componentes/Segmentado';
export { default as Folha } from './componentes/Folha';
