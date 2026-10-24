import { Text, type TextProps, type TextStyle } from 'react-native';

import { criarEstilos, useTema } from '../TemaProvider';
import type { Tema } from '../tema';

export type VarianteTexto =
  | 'display'
  | 'titulo'
  | 'subtitulo'
  | 'destaque'
  | 'corpo'
  | 'corpoForte'
  | 'rotulo'
  | 'legenda'
  | 'sobretitulo';

type CorTexto = 'texto' | 'secundario' | 'sobrePrimaria' | 'primaria' | 'erro';

type TextoProps = TextProps & {
  variante?: VarianteTexto;
  cor?: CorTexto;
  /** Cor fora da escala do tema (ex: texto de um selo). Prefira `cor`. */
  corPersonalizada?: string;
  alinhamento?: TextStyle['textAlign'];
};

const cores = (t: Tema): Record<CorTexto, string> => ({
  texto: t.cores.texto,
  secundario: t.cores.textoSecundario,
  sobrePrimaria: t.cores.textoSobrePrimaria,
  primaria: t.cores.primaria,
  erro: t.cores.erro,
});

const useEstilos = criarEstilos((t) => {
  const tam = t.tipografia.tamanho;
  const peso = t.tipografia.peso;
  const linha = (n: number) => Math.round(n * t.tipografia.entrelinha);
  return {
    display: { fontSize: tam.display, lineHeight: linha(tam.display), fontWeight: peso.negrito, fontFamily: t.tipografia.familia.titulo },
    titulo: { fontSize: tam.titulo, lineHeight: linha(tam.titulo), fontWeight: peso.negrito, fontFamily: t.tipografia.familia.titulo },
    subtitulo: { fontSize: tam.subtitulo, lineHeight: linha(tam.subtitulo), fontWeight: peso.negrito, fontFamily: t.tipografia.familia.titulo },
    destaque: { fontSize: tam.destaque, lineHeight: linha(tam.destaque), fontWeight: peso.negrito, fontFamily: t.tipografia.familia.corpo },
    corpo: { fontSize: tam.corpo, lineHeight: linha(tam.corpo), fontWeight: peso.regular, fontFamily: t.tipografia.familia.corpo },
    corpoForte: { fontSize: tam.corpo, lineHeight: linha(tam.corpo), fontWeight: peso.negrito, fontFamily: t.tipografia.familia.corpo },
    rotulo: { fontSize: tam.rotulo, lineHeight: linha(tam.rotulo), fontWeight: peso.regular, fontFamily: t.tipografia.familia.corpo },
    legenda: { fontSize: tam.legenda, lineHeight: linha(tam.legenda), fontWeight: peso.regular, fontFamily: t.tipografia.familia.corpo },
    sobretitulo: {
      fontSize: tam.legenda,
      lineHeight: linha(tam.legenda),
      fontWeight: peso.negrito,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      fontFamily: t.tipografia.familia.corpo,
    },
  };
});

/** Todo texto das telas novas passa por aqui: tamanho, peso e cor vêm do tema. */
export default function Texto({
  variante = 'corpo',
  cor = 'texto',
  corPersonalizada,
  alinhamento,
  style,
  ...props
}: TextoProps) {
  const tema = useTema();
  const estilos = useEstilos();
  return (
    <Text
      style={[
        estilos[variante],
        { color: corPersonalizada ?? cores(tema)[cor] },
        alinhamento ? { textAlign: alinhamento } : null,
        style,
      ]}
      {...props}
    />
  );
}
