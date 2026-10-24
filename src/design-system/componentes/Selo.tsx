import { View } from 'react-native';

import { criarEstilos, useTema } from '../TemaProvider';
import type { ParDeCores, Tema } from '../tema';
import Texto from './Texto';

export type TomSelo = keyof Tema['tom'] | `risco.${keyof Tema['risco']}`;

const useEstilos = criarEstilos((t) => ({
  selo: {
    alignSelf: 'flex-start',
    borderRadius: t.raio.sm,
    paddingHorizontal: t.espaco.sm,
    paddingVertical: t.espaco.xxs + 1,
  },
  pilula: { borderRadius: t.raio.pilula, paddingHorizontal: t.espaco.md },
}));

function cores(tema: Tema, tom: TomSelo): ParDeCores {
  if (tom.startsWith('risco.')) return tema.risco[tom.slice(6) as keyof Tema['risco']];
  return tema.tom[tom as keyof Tema['tom']];
}

/** Rótulo curto de estado: "Ponto exato", "Confiança 87%", nível de risco. */
export default function Selo({ rotulo, tom = 'neutro', pilula }: { rotulo: string; tom?: TomSelo; pilula?: boolean }) {
  const tema = useTema();
  const estilos = useEstilos();
  const par = cores(tema, tom);
  return (
    <View style={[estilos.selo, pilula && estilos.pilula, { backgroundColor: par.fundo }]}>
      <Texto variante="legenda" corPersonalizada={par.texto} style={{ fontWeight: tema.tipografia.peso.negrito }}>
        {rotulo}
      </Texto>
    </View>
  );
}
