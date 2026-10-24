import { Pressable, View } from 'react-native';

import { criarEstilos } from '../TemaProvider';
import Texto from './Texto';

type Opcao<T> = { valor: T; rotulo: string };

type SegmentadoProps<T> = {
  opcoes: readonly Opcao<T>[];
  valor: T;
  onMudar: (valor: T) => void;
  accessibilityLabel: string;
};

const useEstilos = criarEstilos((t) => ({
  grupo: {
    flexDirection: 'row',
    padding: t.espaco.xs,
    borderRadius: t.raio.md + 2,
    backgroundColor: t.cores.superficieSuave,
  },
  opcao: {
    flex: 1,
    minHeight: 36,
    borderRadius: t.raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ativa: { backgroundColor: t.cores.superficie, ...t.sombra.baixa },
}));

/** Escolha única entre poucas opções (ex: 7, 14 ou 30 dias). */
export default function Segmentado<T extends string | number>({ opcoes, valor, onMudar, accessibilityLabel }: SegmentadoProps<T>) {
  const estilos = useEstilos();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={estilos.grupo}>
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor;
        return (
          <Pressable
            key={String(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativa }}
            onPress={() => onMudar(opcao.valor)}
            style={[estilos.opcao, ativa && estilos.ativa]}
          >
            <Texto variante={ativa ? 'corpoForte' : 'corpo'} cor={ativa ? 'texto' : 'secundario'}>
              {opcao.rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}
